FROM ubuntu:18.04
RUN apt-get update -qq 
RUN apt-get install -y tesseract-ocr libtesseract-dev libleptonica-dev python3 python3-distutils python3-pip ffmpeg
RUN pip3 install --upgrade pip

ENV PATH="$HOME/.local/bin:$PATH"

# Create app directory
WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Bundle app source
COPY . .

CMD python3 app.py