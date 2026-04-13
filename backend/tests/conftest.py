import os
import tempfile
import sys
from pathlib import Path

TEST_DB_DIR = Path(tempfile.gettempdir()) / "preanesthetic_assessment_tests"
TEST_DB_DIR.mkdir(parents=True, exist_ok=True)
TEST_DB_PATH = TEST_DB_DIR / "test_preanesthetic_assessment.db"
if TEST_DB_PATH.exists():
    TEST_DB_PATH.unlink()
os.environ["PREANESTHETIC_DB_URL"] = f"sqlite:///{TEST_DB_PATH}"

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))
