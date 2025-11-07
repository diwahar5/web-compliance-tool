pip install -r requirements.txt
python -m playwright install
uvicorn main:app --reload
