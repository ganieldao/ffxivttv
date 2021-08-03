FROM ubuntu:18.04
RUN apt-get update -qq 
RUN apt-get install -y tesseract-ocr libtesseract-dev libleptonica-dev python3 python3-distutils python3-pip ffmpeg
RUN pip3 install --upgrade pip
RUN pip3 install pytesseract streamlink flask opencv-python gunicorn twitchAPI apscheduler

ENV PATH="$HOME/.local/bin:$PATH"

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY app .

RUN ls
RUN echo $PATH

EXPOSE 5000

CMD gunicorn main:app -b 0.0.0.0:$PORT --log-file -