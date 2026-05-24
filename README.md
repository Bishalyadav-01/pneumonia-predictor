# Pneumonia Risk Predictor

A machine learning-based clinical decision-support tool for pneumonia prediction, built as a B.Tech CS-106 project at Delhi Technological University.

## Live Demo
[→ Deploy to Netlify](#deployment) and paste the link here.

## Features
- **Gradient Boosting classifier** trained on 1,500 clinical records
- **71% accuracy, 71% pneumonia recall** (threshold-tuned for clinical safety)
- Interactive patient data input: SpO₂, WBC count, symptoms, chest X-ray
- Real-time feature contribution visualization
- Dark mode support

## How to Run Locally

```bash
npm install
npm run dev
```

## Deployment (Netlify — 2 minutes)

```bash
npm run build          # creates /dist folder
```

Then go to **[app.netlify.com](https://app.netlify.com)** → drag & drop the `/dist` folder → done.

## Tech Stack
- React 18 + Vite
- Scikit-learn (training, Python)
- Pandas, Matplotlib, Seaborn

## Authors
- Ved Bhartwal
- Wagesh Sharma  
- Bishal Prasad Yadav

Submitted to: Asst. Prof. Anshika Arora  
Course: Basic Machine Learning (CS-106)  
Delhi Technological University
