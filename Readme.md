<!-- markdownlint-disable -->
<p align="center">
    <!-- github-banner-start -->
    <img src="https://raw.githubusercontent.com/hotosm/fmtm/main/docs/images/hot_logo.png" alt="HOTOSM Logo" width="25%" height="auto" />
    <!-- github-banner-end -->
</p>

<div align="center">
    <h1>fAIr: AI-assisted Mapping</h1>
    <p>Open AI-assisted mapping service for Humanitarian</p>
    <a href="https://github.com/hotosm/fair/releases">
        <img src="https://img.shields.io/github/v/release/hotosm/fair?logo=github" alt="Release Version" />
    </a>
</div>

</br>

<!-- prettier-ignore-start -->
<div align="center">

| **CI/CD** | | [![Backend Build](https://github.com/hotosm/fair/actions/workflows/backend_build.yml/badge.svg?branch=master)](https://github.com/hotosm/fair/actions/workflows/backend_build.yml) [![Frontend Build](https://github.com/hotosm/fair/actions/workflows/frontend_build.yml/badge.svg?branch=master)](https://github.com/hotosm/fair/actions/workflows/frontend_build.yml) |
| :--- | :--- | :--- |
| **Tech Stack** | | ![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django) ![React](https://img.shields.io/badge/React-20232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) |
| **Code Style** | | [![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](https://pre-commit.com) [![Black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black) |
| **Community** | | [![Slack](https://img.shields.io/badge/Slack-Join%20the%20community!-d63f3f?style=for-the-badge&logo=slack&logoColor=white)](https://slack.hotosm.org) [![All Contributors](https://img.shields.io/github/all-contributors/hotosm/fair?color=ee8449&style=flat-square)](#contributors-) |
| **Other Info** | | [![Roadmap](https://img.shields.io/badge/Roadmap-View%20Plan-blue.svg)](https://github.com/orgs/hotosm/projects/40) [![License](https://img.shields.io/github/license/hotosm/fair.svg)](https://github.com/hotosm/fair/blob/main/LICENSE.md) |

</div>

fAIr is an open AI-assisted mapping service developed by the [Humanitarian OpenStreetMap Team (HOT)](https://www.hotosm.org/) that aims to improve the efficiency and accuracy of mapping efforts for humanitarian purposes. The service uses AI models, specifically computer vision techniques, to detect objects such as buildings, roads, waterways, and trees from satellite and UAV imagery.

The name fAIr is derived from the following terms:

- **f**: for freedom and free and open-source software
- **AI**: for Artificial Intelligence
- **r**: for resilience and our responsibility for our communities and the role we play within humanitarian mapping

## Features

- Intuitive and fair AI-assisted mapping tool
- Open-source AI models created and trained by local communities
- Uses open-source satellite and UAV imagery from HOT's OpenAerialMap (OAM) to detect map features and suggest additions to OpenStreetMap (OSM)
- Constant feedback loop to eliminate model biases and ensure models are relevant to local communities

Unlike other AI data producers, fAIr is a free and open-source AI service that allows OSM community members to create and train their own AI models for mapping in their region of interest and/or humanitarian need. The goal of fAIr is to provide access to AI-assisted mapping across mobile and in-browser editors, using community-created AI models, and to ensure that the models are relevant to the communities where the maps are being created to improve the conditions of the people living there.

To eliminate model biases, fAIr is built to work with the local communities and receive constant feedback on the models, which will result in the progressive intelligence of computer vision models. The AI models suggest detected features to be added to OpenStreetMap (OSM), but mass import into OSM is not planned. Whenever an OSM mapper uses the AI models for assisted mapping and completes corrections, fAIr can take those corrections as feedback to enhance the AI model’s accuracy.

## Product Roadmap (Users' Roadmap)

<!-- prettier-ignore-start -->
| Status | Feature |
|:--:| :-- |
|✅| training of local AI models using local datasets |
|✅| prediction of map features using locally trained models |
|✅| iterative re-training of models via user feedback |
|✅| mapping predictions into OSM using JOSM |
|✅| improvements to the prediction algorithm: adopting YOLOv8 model |
|✅| UI/UX redesign to enhance the user experience |
|✅| fAIr evaluation research with Masaryk University & Missing Maps Czechia and Slovakia, welcome to join the efforts, [here is the final report](https://drive.google.com/file/d/10axeli5RozCE0gL2XeTIugAUHJPUDgvu/view?usp=sharing) 
|🔄| Handling User Profile
|🔄| Notifications features
|📅| Replicable Models
|📅| Offline AI Prediction
|📅| Post Processing
|📅| fAIrSwipe, integration with MapSwipe, [more details](https://docs.google.com/document/d/1dWQlBl6HM7Nky-deahw0DfKlOOEbBhuWRPnLquyf7jU/edit?usp=sharing)

|👀| You can follow [here](https://docs.google.com/document/d/1A8kRG-Tw922bV8CTz4HXjCpp7cZmHSpehLOQQF1EXao/edit?usp=sharing) the details and scope of each of the above features. and you can see and follow the [Figma design progress](https://www.figma.com/design/1WXme5jfWV4tCaY9Rcaekk/fAIr-Project---UIUX-Team?node-id=2772-7466&p=f) for current in development 🔄 features

<!-- prettier-ignore-end -->

A higher level roadmap for 2025 can be found on
[Github](https://github.com/orgs/hotosm/projects/40).

# General Workflow of fAIr

![fAIr1](https://github.com/hotosm/fAIr/assets/97789856/01c0e3b6-a00c-439d-a2ed-1c14b62e6364)

1. First We expect there should be a fully mapped and validated task in project Area where model will be trained on
2. fAIr uses OSM features as labels which are fetched from [Raw Data API] (https://github.com/hotosm/raw-data-api) and Tiles from OpenAerialMap (https://map.openaerialmap.org/)
3. Once data is ready fAIr supports creation of local model with the input area provided , Publishes model for that area which can be implemented on the rest of the similar area
4. Feedback is important aspect , If mappers is not satisfied with the prediction that fAIr is making they can submit their feedback and community manager can apply feedback to model so that model will learn
<hr>

# fAIr Architecture

![fAIr2](https://github.com/hotosm/fAIr/assets/97789856/63394f65-ce0d-4a3d-8683-7455f14fb366)

The backend is using library we call it [fAIr utilities](https://github.com/hotosm/fAIr-utilities) to handle:

     1. Data preparation for the models
     2. Models trainings
     3. Inference process
     4. Post processing (converting the predicted features to geo data)

## Local Installation [DEV]

Checkout Docker Installation [docs](./docs/Docker-installation.md)

## Get involved!

- Start by reading our [Code of conduct](https://github.com/hotosm/fAIr/blob/master/docs/Code-of-Conduct.md)
- Get familiar with our [contributor guidelines](CONTRIBUTING.md) explaining the different ways in which you can support this project! We need your help!
