---
title: "Generalizability of Wearable-based Acute Illness Detection Models"
published: true
description: "A cross-study Analysis of Wearable Datasets and the Generalizability of Acute Illness Monitoring Models"
tags: ["Wearable", "Illness Detection", "Generalizability"]
date: "Jun 27 2024"
---

# [A cross-study Analysis of Wearable Datasets and the Generalizability of Acute Illness Monitoring Models](https://proceedings.mlr.press/v248/kasl24a.html)

Large-scale wearable datasets are increasingly being used for biomedical research and to develop machine learning (ML) models for longitudinal health monitoring applications. However, it is largely unknown whether biases in these datasets lead to findings that do not generalize. Here, we present the first comparison of the data underlying multiple longitudinal, wearable-device-based datasets. We examine participant-level resting heart rate (HR) from four studies, each with thousands of wearable device users. We demonstrate that multiple regression, a community standard statistical approach, leads to conflicting conclusions about important demographic variables (age vs resting HR) and significant intra- and inter-dataset differences in HR. We then directly test the cross-dataset generalizability of a commonly used ML model trained for three existing day-level monitoring tasks: prediction of testing positive for a respiratory virus, flu symptoms, and fever symptoms. Regardless of task, most models showed relative performance loss on external datasets; most of this performance change can be attributed to concept shift between datasets. These findings suggest that research using large-scale, pre-existing wearable datasets might face bias and generalizability challenges similar to research in more established biomedical and ML disciplines. We hope that the findings from this study will encourage discussion in the wearable-ML community around standards that anticipate and account for challenges in dataset bias and model generalizability.

![Directional changes](../../../src/data/figures/gener_line.png)