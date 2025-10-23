# AI Image Creator with Stability AI & Flask 🎨

A full-stack web application that allows users to generate unique, high-quality images from text prompts using the power of Stability AI's SDXL model. The backend is built with Python and Flask, and the frontend is a responsive single-page application.



## ✨ Features

* **Text-to-Image Generation:** Convert your ideas into visual art simply by typing a description.
* **Style Selection:** Choose from various art styles (e.g., Realistic, Cartoon, Fantasy) to customize your creation.
* **Image Management:** View, download, share, and view your generated images in fullscreen.
* **Creation Gallery:** Automatically saves your generated images to a personal gallery for later viewing.
* **Responsive Design:** A clean, modern UI that works seamlessly on both desktop and mobile devices.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Python 3, Flask
* **API:** [Stability AI API](https://platform.stability.ai/) (Stable Diffusion XL 1.0)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* **Python 3.8+** installed on your system.
* A **Stability AI account** and API key.
    * You can get your key from the [Stability AI Platform](https://platform.stability.ai/).

### Installation & Setup

1.  **Clone the Repository**
github: sarjanthecoder

2.  **Set up the Python Backend**
    * Create and activate a virtual environment:

        * **macOS / Linux:**
            ```sh
            python3 -m venv venv
            source venv/bin/activate
            ```
        * **Windows:**
            ```sh
            python -m venv venv
            .\venv\Scripts\activate
            ```

    * Create a file named `requirements.txt` and add the following lines:
        ```txt
        Flask
        Flask-Cors
        requests
        ```

    * Install the required packages:
        ```sh
        pip install -r requirements.txt
        ```

3.  **Add Your API Key**
    * Open the `server.py` file.
    * Find the line that says `STABILITY_API_KEY = 'sk-...'`.
    * Replace the placeholder key with your actual Stability AI API key.

4.  **Run the Application**
    * Start the Flask server:
        ```sh
        python server.py
        ```
    * The server will start, and you'll see a message like: `🚀 Starting Python Flask server for Stability AI...`

5.  **Access the Website**
    * Open your web browser and navigate to:
        [http://127.0.0.1:5500](http://127.0.0.1:5500)

---

