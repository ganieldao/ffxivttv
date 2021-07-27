FROM ubuntu:18.04
RUN apt-get update -qq 
RUN apt-get install -y tesseract-ocr libtesseract-dev libleptonica-dev python3 python3-distutils python3-pip ffmpeg opencv-python
RUN pip3 install --upgrade pip
RUN pip3 install pytesseract streamlink flask

ENV PATH="$HOME/.local/bin:$PATH"

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN ls
RUN echo $PATH

EXPOSE 5000

CMD [ "python3", "app.py" ]