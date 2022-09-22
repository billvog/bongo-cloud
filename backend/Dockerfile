FROM python:3.10

COPY . code
WORKDIR /code

RUN pip install pip --upgrade && \
		pip install -r requirements.txt

ENV BONGO_PRODUCTION true

EXPOSE 8000

RUN chmod +x entrypoint.sh

CMD ["/code/entrypoint.sh"]