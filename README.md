# ChurnGuard — Customer Churn Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org)

**ChurnGuard** is a full-stack, enterprise-grade customer churn prediction and retention platform. Built using **FastAPI**, **scikit-learn**, **XGBoost**, and **React + TypeScript + Tailwind CSS**, ChurnGuard systematically benchmarks baseline classifiers against state-of-the-art **Bagging**, **Boosting**, and **Stacking** ensembles on the official **IBM Telco Customer Churn** dataset.

---

## 1. System Architecture

```
                                  +---------------------------------------+
                                  |     React + TypeScript + Vite UI      |
                                  |  (Overview, Data, Models, Evaluation, |
                                  |    Customer Profiler, Insights)       |
                                  +---------------------------------------+
                                                     |
                                            REST API Requests
                                                     v
+----------------------------------------------------------------------------------------------------+
|                                    FastAPI Backend Service                                         |
|                                                                                                    |
|  +---------------------+   +---------------------+   +---------------------+   +----------------+  |
|  | /api/dataset/*      |   | /api/models/*       |   | /api/predict        |   | /api/insights  |  |
|  | Summary & Pipeline  |   | Comparison, K-Fold  |   | Real-Time Inference |   | Feature MDI    |  |
|  +---------------------+   +---------------------+   +---------------------+   +----------------+  |
|            |                          |                          |                     |           |
|            v                          v                          v                     v           |
|  +----------------------------------------------------------------------------------------------+  |
|  |                                  ML & Data Services Layer                                     |  |
|  |  * Data Pipeline: Type Casting, Missing Imputation, One-Hot Encoding, StandardScaler, SMOTE  |  |
|  |  * 8 Trained Models: Logistic Regression, Decision Tree, Random Forest, Bagging Classifier,  |  |
|  |                     AdaBoost, Gradient Boosting, XGBoost, Heterogeneous Stacking             |  |
|  |  * Module 2.3 Evaluation: Confusion Matrix, ROC-AUC, Precision, Recall, Specificity, F1      |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                     |                                              |
|                                                     v                                              |
|                                  +-------------------------------------+                           |
|                                  |   SQLite Database via SQLAlchemy    |                           |
|                                  |   (model_runs, prediction_logs)     |                           |
|                                  +-------------------------------------+                           |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Mathematical Foundation of Ensemble Techniques

Ensemble methods combine multiple learning algorithms to obtain superior predictive performance compared to any constituent solitary model.

### 2.1 Bagging (Bootstrap Aggregating)
* **Goal**: **Variance Reduction**
* **Models Implemented**: `RandomForestClassifier`, `BaggingClassifier`
* **Mechanism**: Given a training set $D$ of size $N$, Bagging draws $B$ bootstrap samples $D_1, D_2, \dots, D_B$ with replacement. An independent base model $f_b(x)$ is fit on each sample. The final ensemble prediction is:
  $$\hat{f}_{\text{bag}}(x) = \frac{1}{B} \sum_{b=1}^{B} f_b(x)$$
* **Variance Decomposition**: If each individual tree has variance $\sigma^2$ and the pairwise correlation between trees is $\rho$, the variance of the ensemble mean is:
  $$\text{Var}\left(\hat{f}_{\text{bag}}\right) = \rho \sigma^2 + \frac{1 - \rho}{B} \sigma^2$$
  As $B \to \infty$, the second term vanishes, leaving $\rho \sigma^2$. Random Forest introduces **random subspace feature sampling** at each split ($m \approx \sqrt{p}$) to deliberately depress $\rho$, driving total variance down.

### 2.2 Boosting
* **Goal**: **Bias Reduction**
* **Models Implemented**: `AdaBoostClassifier`, `GradientBoostingClassifier`, `XGBClassifier`
* **Mechanism**: Boosting trains base learners sequentially rather than in parallel. Each subsequent learner compensates for the deficiencies of its predecessors:
  1. **AdaBoost**: Reweights individual customer instances based on prior error:
     $$w_i^{(m)} = w_i^{(m-1)} \exp\left( \alpha_m \cdot \mathbb{I}(y_i \neq f_m(x_i)) \right)$$
     Hard-to-classify churners receive exponentially greater weight in subsequent iterations.
  2. **Gradient Boosting (GBM)**: Formulates boosting as gradient descent in function space, fitting trees to pseudo-residuals:
     $$r_{im} = -\left[\frac{\partial L(y_i, f(x_i))}{\partial f(x_i)}\right]_{f = f_{m-1}}$$
  3. **XGBoost (Extreme Gradient Boosting)**: Utilizes a second-order Taylor series approximation of the loss function:
     $$\tilde{L}^{(t)} \approx \sum_{i=1}^{n} \left[ g_i f_t(x_i) + \frac{1}{2} h_i f_t^2(x_i) \right] + \Omega(f_t)$$
     where $g_i = \partial_{\hat{y}} L$ and $h_i = \partial^2_{\hat{y}} L$, coupled with exact column subsampling and depth-first tree pruning to prevent overfitting on noisy customer records.

### 2.3 Stacking (Stacked Generalization)
* **Goal**: **Heterogeneous Inductive Bias Synergy**
* **Models Implemented**: `StackingClassifier` (Random Forest + XGBoost + Logistic Regression with Logistic Regression Meta-Learner)
* **Mechanism**: Unlike Bagging and Boosting which use homogeneous base estimators, Stacking pools disparate algorithm families. Base learners generate out-of-fold probability vectors $\hat{P}_1(x), \dots, \hat{P}_K(x)$. A meta-learner $g$ is trained on these stacked predictions:
  $$\hat{y}_{\text{final}} = g\left( \hat{P}_{\text{RF}}(x), \hat{P}_{\text{XGB}}(x), \hat{P}_{\text{LR}}(x) \right)$$
  This allows the model to leverage linear separability where suitable and deep hierarchical non-linear interactions elsewhere.

---

## 3. Dataset & Preprocessing Pipeline

* **Source**: Official IBM Telco Customer Churn dataset (`WA_Fn-UseC_-Telco-Customer-Churn.csv`).
* **Dimensions**: 7,043 customer observations, 21 attributes.
* **Class Imbalance**:
  - Non-Churners (`No`): 5,174 (73.4%)
  - Churners (`Yes`): 1,869 (26.6%)
  - Natural Ratio: ~2.77 : 1
* **Cleaning Steps**:
  1. **Missing Values**: 11 rows in `TotalCharges` contain blank spaces `" "` corresponding strictly to new subscribers with `tenure = 0`. These are cleanly coerced to `0.0` float values.
  2. **Categorical Dummy Encoding**: One-hot encoding applied to 16 categorical variables with `drop_first=True` to avoid multicollinearity.
  3. **Standard Scaling**: Continuous features (`tenure`, `MonthlyCharges`, `TotalCharges`) transformed via `StandardScaler` to zero mean and unit variance.
  4. **SMOTE (Synthetic Minority Over-sampling Technique)**: Applied exclusively on the training split to synthesize plausible minority-class customer vectors along the 5-nearest neighbor simplexes, balancing the training set to a 50:50 ratio.

---

## 4. Empirical Evaluation Benchmark

All models are evaluated on an identical **20% holdout test partition** ($N = 1,409$) and verified using **5-Fold Stratified Cross-Validation**:

| Algorithm | Family | ROC-AUC | Accuracy | Precision | Recall (Sens) | Specificity | F1-Score | 5-Fold Mean AUC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost** 🏆 | Boosting | **0.849** | **79.2%** | **59.8%** | **68.2%** | **83.1%** | **0.638** | **0.846 ± 0.012** |
| **Stacking Ensemble** | Stacking | 0.846 | 78.8% | 58.7% | 68.7% | 82.5% | 0.633 | 0.844 ± 0.014 |
| **Gradient Boosting** | Boosting | 0.844 | 78.5% | 58.0% | 67.9% | 82.3% | 0.626 | 0.841 ± 0.013 |
| **Random Forest** | Bagging | 0.838 | 78.1% | 57.3% | 64.7% | 83.0% | 0.607 | 0.835 ± 0.015 |
| **AdaBoost** | Boosting | 0.836 | 77.9% | 56.4% | 68.4% | 81.3% | 0.618 | 0.833 ± 0.016 |
| **Logistic Regression** | Baseline | 0.832 | 75.3% | 52.3% | 76.5% | 74.9% | 0.621 | 0.831 ± 0.017 |
| **Bagging Classifier** | Bagging | 0.824 | 77.4% | 56.5% | 60.7% | 83.4% | 0.585 | 0.821 ± 0.018 |
| **Decision Tree** | Baseline | 0.768 | 74.8% | 52.1% | 59.4% | 80.4% | 0.555 | 0.762 ± 0.024 |

*Note: In churn applications, **Recall (Sensitivity)** is prioritized to prevent costly missed churners (False Negatives), while maintaining high **ROC-AUC** for discriminatory calibration.*

---

## 5. Application Pages & Capabilities

1. **Overview Dashboard (`/`)**:
   - Executive KPI cards (Overall Churn Rate, Population, Champion ROC-AUC, High-Risk Cohort Count).
   - Churn Distribution Donut and Tenure Hazard Rate charts.
   - Champion Model Architecture highlight.
   - Real-time prediction activity feed.

2. **Data & Preprocessing (`/data`)**:
   - Statistical dataset summary (7,043 rows, 21 columns).
   - Interactive before-and-after class imbalance visualization (Raw vs SMOTE).
   - 5-stage preprocessing architecture pipeline breakdown.
   - Raw data preview with column filtering.

3. **Model Training & Comparison (`/training`)**:
   - Interactive training cockpit: select algorithm, toggle SMOTE, and trigger live training runs.
   - Algorithm benchmark bar charts comparing ROC-AUC, Accuracy, and F1.
   - SQL-persisted leaderboard table.

4. **Model Evaluation (`/evaluation`)**:
   - Interactive Visual Confusion Matrix with Type I (FP) and Type II (FN) error rates.
   - Full diagnostic ratio grid: ROC-AUC, Precision, Recall/Sensitivity, Specificity, F1-Score.
   - Multi-model overlaid ROC curves with AUC legends.
   - 5-fold cross-validation stability table.
   - "Which Model Wins & Why" analytical conclusion panel.

5. **Customer Profiler / Try It (`/predict`)**:
   - Interactive subscriber input form with sliders and dropdowns.
   - Smart preset customer personas: "High Risk Churner", "Loyal Long-Term", "Moderate Streamer".
   - Real-time Churn Probability Dial and Risk Tier badge (`LOW`, `MEDIUM`, `HIGH`).
   - Explainable key drivers breakdown (local feature attribution).
   - Actionable proactive retention playbook.

6. **Feature Insights (`/insights`)**:
   - Global Feature Importance horizontal bar chart from champion tree models.
   - Narrative domain takeaways (Contract duration impact, 12-month hazard window, fiber optic disconnect, payment friction).

---

## 6. Getting Started & Setup Guide

### Prerequisites
- Python 3.11+
- Node.js v18+ & npm

### Quickstart (Single Command)
To launch both the FastAPI backend and Vite frontend concurrently:
```bash
./run.sh
```

### Manual Backend Setup
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000` (Swagger UI at `/docs`).

### Manual Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend dashboard will be accessible at: `http://localhost:5173`.

### Running Automated Tests
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest tests/test_backend.py -v
```

---

## 7. Viva & Academic Defense Q&A

**Q1: Why does XGBoost outperform single decision trees and random forests?**
> A single decision tree suffers from high variance and tends to overfit training partitions. Random Forest lowers variance by averaging de-correlated trees, but each tree is grown independently. XGBoost sequentially fits trees to second-order pseudo-residuals of the loss function, aggressively correcting hard-to-classify minority churners while penalizing model complexity via shrinkage ($\eta$) and leaf weight regularization ($\gamma, \lambda$).

**Q2: What is the difference between Sensitivity and Specificity in this project?**
> Sensitivity (Recall) measures the proportion of actual churners correctly identified: $TP / (TP + FN)$. In churn prevention, Sensitivity is critical because missing an at-risk subscriber (False Negative) results in direct revenue loss. Specificity measures the proportion of loyal subscribers correctly identified: $TN / (TN + FP)$, guarding against unnecessary retention discounts given to safe customers.

**Q3: Why use SMOTE instead of simple random oversampling or class weighting?**
> Random oversampling duplicates existing minority instances, causing decision trees to create overly specific, tight leaf boundaries that overfit. SMOTE selects $k$-nearest neighbors of each minority instance and interpolates synthetic points along the connecting line segments in feature space, enriching the decision boundary without duplicating samples.

**Q4: How does Stacking differ from Voting?**
> Voting simply averages predictions or takes a majority vote with fixed weights. Stacking uses the predicted probabilities of multiple diverse base learners as new feature inputs to train a second-level meta-learner (e.g. Logistic Regression), which learns the optimal non-linear blending weights based on each model's strengths.
