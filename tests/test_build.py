"""Run the real build in isolation, including a non-UTF-8 host default."""
from pathlib import Path
import os
import shutil
import subprocess
import sys
import tempfile
import unittest


class BuildTest(unittest.TestCase):
    def test_build_is_utf8_independent_of_host_encoding(self):
        root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory(prefix="ccp-build-test-") as folder:
            target = Path(folder)
            shutil.copy2(root / "build.py", target / "build.py")
            shutil.copytree(root / "src", target / "src")
            # Emulate the Windows default on any platform; explicit encodings
            # are untouched. Exercise the actual build script, not a fake build.
            runner = """
import builtins, runpy, sys
original = builtins.open
def host_open(file, mode='r', buffering=-1, encoding=None, *args, **kwargs):
    if 'b' not in mode and encoding is None:
        encoding = 'cp1252'
    return original(file, mode, buffering, encoding, *args, **kwargs)
builtins.open = host_open
runpy.run_path(sys.argv[1], run_name='__main__')
"""
            result = subprocess.run(
                [sys.executable, "-c", runner, str(target / "build.py")],
                capture_output=True, env={**os.environ, "PYTHONUTF8": "0"},
            )
            self.assertEqual(result.returncode, 0, result.stderr.decode("utf-8", errors="replace"))
            source = (target / "src/physics.js").read_text(encoding="utf-8")
            for name in ("copenhagen_cable_park_sim.html", "copenhagen_cable_park_sim.frag.html"):
                built = (target / "dist" / name).read_text(encoding="utf-8")
                self.assertIn(source, built)
                self.assertNotIn("/*__PHYSICS__*/", built)
                self.assertIn("FYSIKKONSTANTER", built)


if __name__ == "__main__":
    unittest.main()
