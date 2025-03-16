![example workflow](https://github.com/omranlm/TDB/actions/workflows/backend_build.yml/badge.svg)

## Backend is created with [Django](https://www.djangoproject.com/)
This project was bootstrapped with  [Geodjango Template](https://github.com/itskshitiz321/geodjangotemplate.git)
#### For Quickly Getting Started
**Note:** Depending upon your OS and Env installation will vary, This project tightly depends on [Tensorflow](https://www.tensorflow.org/install/pip) with GPU support so accordingly build your development environment
### Install Python3, pip and virtualenv first
##### Skip this, step if you already have one
    sudo apt-get install python3
    sudo apt-get install -y python3-pip
    sudo apt install python3-virtualenv
##### Create your virtual env
    virtualenv env
    source ./env/bin/activate

##### Setup Basemodels (Ramp Supported Currently)
- Install git lfs
```bash
sudo apt-get install git-lfs
```

- Clone Ramp Basemodel
```
git clone https://github.com/radiantearth/model_ramp_baseline.git
```

- Clone Ramp - Code
Note: This clone location will be your RAMP_HOME
```
git clone https://github.com/kshitijrajsharma/ramp-code-fAIr.git ramp-code
```

- Copy Basemodel checkpoint to ramp-code
```
cp -r model_ramp_baseline/data/input/checkpoint.tf ramp-code/ramp/checkpoint.tf
```


- Remove basemodel repo we don't need it anymore
```
rm -rf model_ramp_baseline
```
- Install numpy
Numpy needs to be installed before gdal
```
pip install numpy==1.23.5
```

- Install gdal and rasetrio
Based on your env : You can either use conda / setup manually on your os
for eg on ubuntu :
```
sudo add-apt-repository ppa:ubuntugis/ppa && sudo apt-get update
sudo apt-get install gdal-bin
sudo apt-get install libgdal-dev
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
pip install --global-option=build_ext --global-option="-I/usr/include/gdal" GDAL==`gdal-config --version`
```

- Install Ramp - Dependecies
```
cd ramp-code && cd colab && make install
```

- For Conda users : You may need to install rtree, gdal , rasterio & imagecodecs separately

```
conda install -c conda-forge rtree
conda install -c conda-forge gdal
conda install -c conda-forge rasterio
conda install -c conda-forge imagecodecs
```

##### Install necessary libraries for fAIr

- Install Tensorflow  from [here] (https://www.tensorflow.org/install/pip) According to your os (Tested Versions : 2.9.2, 2.8.0)

- Upgrade your setuptools before installing fair-utilities

```
pip install --upgrade setuptools
```

- Install fAIr Utilities
```
pip install hot-fair-utilities==1.0.41
```

**Remember In order to run fAIr , You need to configure your PC with tensorflow - GPU Support**

You can check your GPU by :

```
import tensorflow as tf
print("Num GPUs Available: ", len(tf.config.experimental.list_physical_devices('GPU')))
```


- Install psycopg2
Again based on your os/env you can do manual installation
for eg : on ubuntu :
```
sudo apt-get install python3-psycopg2
```

- Install redis server on your pc

```
sudo apt install redis
```

- Install pdm for dependency management

```
pip install pdm
```

- Finally install project dependencies

```
pdm install
```

### Make sure you have postgresql installed with postgis extension enabled


#### Configure .env:
    Create .env in the root backend project , and add the credentials as provided on .env_sample , Export your secret key and database url to your env

    Export your database url
    ```
    export DATABASE_URL=postgis://postgres:postgres@localhost:5432/ai
    ```

    You will need more env variables (Such as Ramp home, Training Home) that can be found on ```.sample_env```

#### Now change your username, password and db name in settings.py accordingly to your database
    python manage.py makemigrations login core
    python manage.py migrate
    python manage.py runserver
### Now server will be available in your 8000 port on web, you can check out your localhost:8000/admin for admin panel
To login on admin panel, create your superuser and login with your credentials restarting the server

    python manage.py createsuperuser

## Authentication
fAIr uses oauth2.0 Authentication using [osm-login-python](https://github.com/kshitijrajsharma/osm-login-python)
1. Get your login Url
    Hit ```/api/v1/auth/login/ ```
    - URL will give you login URL which you can use to provide your osm credentials and authorize fAIr
    - After successful login  you will get access-token that you can use across all osm login required endpoints in fAIr
2. Check authentication by getting back your data
    Hit ```/api/v1/auth/me/```
    - URL requires access-token as header and in return you will see your osm username, id and image url


## Start celery workers

-  Start celery workers

```
celery -A aiproject worker --loglevel=debug -n my_worker
```

- Monitor using flower
if  you are using redis as result backend, api supports both options django / redis
You can start flower to start monitoring your tasks
```
celery -A aiproject  --broker=redis://127.0.0.1:6379/0 flower
```

## Start background tasks 
```bash
python manage.py qcluster
```

## Run Tests

```
python manage.py test
```


# Build fAIr with Docker for Development
- Install all the required drivers for your graphics to access it from containers, and check your graphics and drivers with ```nvidia-smi``` . Up to now only nvidia is Supported
- Follow docker_sample_env to create ```.env``` file in your dir
- Build the Image

```
docker-compose up -d --build
```
- Once the image is build, Open the API container terminal and run the migrations

## Setting up environment variables

1. Create a `.env` file in the root directory of the backend project.
2. Add the following environment variables to the `.env` file:

```
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=postgis://postgres:postgres@localhost:5432/ai
EXPORT_TOOL_API_URL=https://raw api url.hotosm.org/v1
CORS_ALLOWED_ORIGINS=http://127.0.0.1:3000
OSM_CLIENT_ID=your_osm_client_id
OSM_CLIENT_SECRET=your_osm_client_secret
OSM_URL=https://www.openstreetmap.org
OSM_SCOPE=read_prefs
OSM_LOGIN_REDIRECT_URI=http://127.0.0.1:3000/authenticate/
OSM_SECRET_KEY=your_osm_secret_key
CELERY_BROKER_URL="redis://redis:6379/0"
CELERY_RESULT_BACKEND="redis://redis:6379/0"
RAMP_HOME="/RAMP_HOME"
TRAINING_WORKSPACE="/TRAINING_WORKSPACE"
TESTING_TOKEN=your_testing_token
GDAL_LIBRARY_PATH=''
MAXAR_CONNECT_ID=your_maxar_connect_id
FRONTEND_URL=https://fair.hotosm.org
BUCKET_NAME=fair-dev
PARENT_BUCKET_FOLDER=dev
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
PRESIGNED_URL_EXPIRY=3600
EPOCHS_LIMIT=20
BATCH_SIZE_LIMIT=8
YOLO_EPOCHS_LIMIT=200
YOLO_BATCH_SIZE_LIMIT=8
RAMP_EPOCHS_LIMIT=40
RAMP_BATCH_SIZE_LIMIT=8
TRAINING_WORKSPACE_DOWNLOAD_LIMIT=200
DEFAULT_PAGINATION_SIZE=50
CORS_ORIGIN_ALLOW_ALL=False
ENABLE_PREDICTION_API=False
LOG_LINE_STREAM_TRUNCATE_VALUE=10
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=example-email@example.com
EMAIL_HOST_PASSWORD=example-email-password
DEFAULT_FROM_EMAIL=no-reply@example.com
```

## Running the project with Docker

1. Ensure you have Docker installed on your machine. If not, follow the instructions [here](https://docs.docker.com/get-docker/) to install Docker.
2. Create a `docker-compose.yml` file in the root directory of the backend project with the following content:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    command: sh -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    env_file:
      - .env
    environment:
      DEBUG: ${DEBUG}
      SECRET_KEY: ${SECRET_KEY}
      DATABASE_URL: ${DATABASE_URL}
      EXPORT_TOOL_API_URL: ${EXPORT_TOOL_API_URL}
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}
      OSM_CLIENT_ID: ${OSM_CLIENT_ID}
      OSM_CLIENT_SECRET: ${OSM_CLIENT_SECRET}
      OSM_URL: ${OSM_URL}
      OSM_SCOPE: ${OSM_SCOPE}
      OSM_LOGIN_REDIRECT_URI: ${OSM_LOGIN_REDIRECT_URI}
      OSM_SECRET_KEY: ${OSM_SECRET_KEY}
      CELERY_BROKER_URL: ${CELERY_BROKER_URL}
      CELERY_RESULT_BACKEND: ${CELERY_RESULT_BACKEND}
      RAMP_HOME: ${RAMP_HOME}
      TRAINING_WORKSPACE: ${TRAINING_WORKSPACE}
      TESTING_TOKEN: ${TESTING_TOKEN}
      GDAL_LIBRARY_PATH: ${GDAL_LIBRARY_PATH}
      MAXAR_CONNECT_ID: ${MAXAR_CONNECT_ID}

  redis:
    image: "redis:alpine"
    ports:
      - "6379:6379"

  pgsql:
    image: "postgis/postgis"
    environment:
      POSTGRES_DB: ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin
    ports:
      - "5432:5432"
```

3. Run the following command to build and start the Docker containers:

```bash
docker-compose up -d --build
```

4. Once the containers are up and running, open the API container terminal and run the migrations:

```bash
docker-compose exec backend python manage.py makemigrations login core
docker-compose exec backend python manage.py migrate
```

5. Create a superuser to access the admin panel:

```bash
docker-compose exec backend python manage.py createsuperuser
```

6. Access the application by navigating to `http://localhost:8000` in your web browser.

7. Access the admin panel by navigating to `http://localhost:8000/admin` and log in with the superuser credentials you created.

8. To stop the Docker containers, run the following command:

```bash
docker-compose down
```
