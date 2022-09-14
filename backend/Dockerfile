FROM python:3.10

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

ENV BONGO_PRODUCTION true

COPY . code
WORKDIR /code

EXPOSE 8000

ENTRYPOINT ["python", "bongocloudapi/manage.py"]
CMD ["runserver", "0.0.0.0:8000"]