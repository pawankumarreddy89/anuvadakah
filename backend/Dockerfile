# 1. Use an official Python runtime as a parent image
FROM python:3.9

# 2. Set the working directory
WORKDIR /code

# 3. Install System Dependencies (Tesseract & Fonts)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    fonts-noto-cjk \
    fonts-noto-hinted \
    fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements and install Python dependencies
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 5. Copy the rest of the application code
COPY . /code

# 6. Create a writable cache directory for Hugging Face
RUN mkdir -p /code/cache
ENV TRANSFORMERS_CACHE=/code/cache
ENV TORCH_HOME=/code/cache
RUN chmod -R 777 /code/cache

# 7. Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]