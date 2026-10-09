/** Supplied static, vertex-coloured GLB embedded by build.py.
 * Convert Z-up, high end X=0 to Y-up, centred X=0, high end positive X.
 * This reader supports this asset's untransformed triangles only. Merge its
 * 1,223 source meshes to one draw submission, retaining vertex colours.
 */
function createCopenHill(THREE) {
  const bytes=Uint8Array.from(atob(COPENHILL_GLB),c=>c.charCodeAt(0));
  const view=new DataView(bytes.buffer),jsonLength=view.getUint32(12,true);
  if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)
    throw Error('Invalid CopenHill GLB');
  const gltf=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+jsonLength)));
  const binStart=28+jsonLength;
  function accessor(index) {
    const a=gltf.accessors[index],b=gltf.bufferViews[a.bufferView];
    const sizes={5121:1,5123:2,5125:4,5126:4},widths={SCALAR:1,VEC3:3,VEC4:4};
    const size=sizes[a.componentType],width=widths[a.type];
    if(!size||!width||a.sparse||b.buffer!==0)throw Error('Unsupported CopenHill accessor');
    const start=binStart+(b.byteOffset||0)+(a.byteOffset||0),stride=b.byteStride||size*width;
    return {count:a.count,get(i,k=0){
      const offset=start+i*stride+k*size;
      if(a.componentType===5126)return view.getFloat32(offset,true);
      const value=a.componentType===5121?view.getUint8(offset):a.componentType===5123?view.getUint16(offset,true):view.getUint32(offset,true);
      return a.normalized?value/(a.componentType===5121?255:a.componentType===5123?65535:4294967295):value;
    }};
  }
  const positions=[],colours=[];
  let sourceMeshes=0;
  for(const node of gltf.nodes){
    if(node.matrix||node.translation||node.rotation||node.scale)throw Error('Unexpected CopenHill transform');
    if(node.mesh===undefined)continue;
    sourceMeshes++;
    for(const primitive of gltf.meshes[node.mesh].primitives){
      if(primitive.mode!==4)throw Error('CopenHill requires triangles');
      const p=accessor(primitive.attributes.POSITION),c=accessor(primitive.attributes.COLOR_0),indices=accessor(primitive.indices);
      for(let i=0;i<indices.count;i++){
        const v=indices.get(i);
        positions.push(95-p.get(v,0),p.get(v,2),p.get(v,1));
        // glTF vertex colours are linear; retain the supplied values.
        colours.push(c.get(v,0),c.get(v,1),c.get(v,2));
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
  geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const model=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));
  model.name='CopenHill supplied proxy';model.receiveShadow=true;
  const root=new THREE.Group();root.name='CopenHill';root.add(model);
  root.userData={source:'copenhill_visual_proxy.glb',sourceMeshes,dimensionsStatus:'Supplied proxy dimensions; placement remains an estimate'};
  return root;
}
if(typeof module!=='undefined'&&module.exports)module.exports={createCopenHill};
