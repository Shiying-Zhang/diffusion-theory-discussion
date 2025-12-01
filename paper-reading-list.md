# 📚 Diffusion Models: Theoretical Foundations - Paper Reading List

> **Curated by Diego & Shiying** | *Last Updated: 2025-12-01*

---

## 🎯 Reading Guide

本列表精选了扩散模型理论研究的核心论文，按照主题和难度组织。我们推荐按照标注的顺序阅读，以建立完整的理论体系。

**标注说明：**
- 🌟 **Foundation** - 基础必读
- 🔬 **Advanced** - 进阶理论
- 💎 **Seminal** - 开创性工作
- 🔥 **Recent** - 近期重要进展

---

## 1️⃣ Mathematical Foundations | 数学基础

### Score-Based Models & Score Matching

1. 💎 **Estimation of Non-Normalized Statistical Models by Score Matching**
   - *Hyvärinen, 2005*
   - [Paper](https://jmlr.org/papers/v6/hyvarinen05a.html)
   - **Why Read:** Score matching 的开创性工作，奠定了后续 denoising score matching 的理论基础
   - **Key Concepts:** Score function, Fisher divergence, implicit score matching

2. 🌟 **A Connection Between Score Matching and Denoising Autoencoders**
   - *Vincent, 2011*
   - [Paper](https://www.iro.umontreal.ca/~vincentp/Publications/smdae_techreport.pdf)
   - **Why Read:** 揭示了 score matching 与 denoising 之间的深刻联系
   - **Key Concepts:** Denoising score matching, connection to autoencoders

3. 💎 🌟 **Generative Modeling by Estimating Gradients of the Data Distribution**
   - *Song & Ermon, NeurIPS 2019*
   - [Paper](https://arxiv.org/abs/1907.05600)
   - **Why Read:** 现代 score-based generative models 的起点
   - **Key Concepts:** Score network, Langevin dynamics, noise perturbation

---

## 2️⃣ Diffusion Process Theory | 扩散过程理论

### Denoising Diffusion Models

4. 💎 **Deep Unsupervised Learning using Nonequilibrium Thermodynamics**
   - *Sohl-Dickstein et al., ICML 2015*
   - [Paper](https://arxiv.org/abs/1503.03585)
   - **Why Read:** 第一个将热力学原理引入生成模型的工作
   - **Key Concepts:** Forward diffusion, reverse diffusion, thermodynamic inspiration

5. 🌟 **Denoising Diffusion Probabilistic Models (DDPM)**
   - *Ho et al., NeurIPS 2020*
   - [Paper](https://arxiv.org/abs/2006.11239)
   - **Why Read:** 扩散模型的里程碑式工作，简化了训练目标
   - **Key Concepts:** Simplified loss, variance schedule, connection to score matching

6. 🔬 **Improved Denoising Diffusion Probabilistic Models**
   - *Nichol & Dhariwal, ICML 2021*
   - [Paper](https://arxiv.org/abs/2102.09672)
   - **Why Read:** 对 DDPM 的重要改进，提升了采样质量
   - **Key Concepts:** Learned variance, hybrid loss, improved noise schedule

### Score-Based SDEs

7. 💎 🌟 **Score-Based Generative Modeling through Stochastic Differential Equations**
   - *Song et al., ICLR 2021*
   - [Paper](https://arxiv.org/abs/2011.13456)
   - **Why Read:** 将离散扩散过程推广到连续 SDE 框架
   - **Key Concepts:** Probability flow ODE, reverse-time SDE, unified framework

---

## 3️⃣ Unified Frameworks | 统一框架

8. 🌟 🔥 **Elucidating the Design Space of Diffusion-Based Generative Models (EDM)**
   - *Karras et al., NeurIPS 2022*
   - [Paper](https://arxiv.org/abs/2206.00364)
   - **Why Read:** **本项目的核心参考文献**，系统分析了扩散模型的设计空间
   - **Key Concepts:** Design space analysis, preconditioning, optimal hyperparameters
   - **Discussion:** 参见我们的 [EDM 框架深度解析](theory-foundations/edm-framework/mathematical-basis.md)

9. 🔬 **Understanding Diffusion Models: A Unified Perspective**
   - *Luo, arXiv 2022*
   - [Paper](https://arxiv.org/abs/2208.11970)
   - **Why Read:** 优秀的综述性工作，统一视角下理解各种扩散模型变体
   - **Key Concepts:** ELBO derivation, connections between variants, unified notation

---

## 4️⃣ Fast Sampling & Acceleration | 快速采样

10. 🌟 **Denoising Diffusion Implicit Models (DDIM)**
    - *Song et al., ICLR 2021*
    - [Paper](https://arxiv.org/abs/2010.02502)
    - **Why Read:** 提出非马尔可夫采样过程，大幅加速推理
    - **Key Concepts:** Deterministic sampling, non-Markovian process, trade-off exploration

11. 🔬 **DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Model Sampling**
    - *Lu et al., NeurIPS 2022*
    - [Paper](https://arxiv.org/abs/2206.00927)
    - **Why Read:** 基于 ODE 理论的高效采样器
    - **Key Concepts:** ODE solver design, exponential integrator, convergence analysis

12. 🔥 **Flow Matching for Generative Modeling**
    - *Lipman et al., ICLR 2023*
    - [Paper](https://arxiv.org/abs/2210.02747)
    - **Why Read:** 新的训练范式，避免了扩散过程的某些限制
    - **Key Concepts:** Flow matching, conditional flows, simulation-free training

---

## 5️⃣ Theoretical Analysis | 理论分析

### Convergence & Sample Complexity

13. 🔬 **Diffusion Models: A Comprehensive Survey of Methods and Applications**
    - *Yang et al., ACM Computing Surveys 2023*
    - [Paper](https://arxiv.org/abs/2209.00796)
    - **Why Read:** 全面的综述，涵盖理论、方法和应用
    - **Key Concepts:** Taxonomy, theoretical guarantees, application domains

14. 🔬 **How Much is Enough? A Study on Diffusion Times in Score-based Generative Models**
    - *Franzese et al., AISTATS 2023*
    - [Paper](https://arxiv.org/abs/2206.05173)
    - **Why Read:** 分析扩散时间与生成质量的关系
    - **Key Concepts:** Diffusion time analysis, trade-offs, empirical insights

### Score Function & Training Dynamics

15. 🔬 **On the Importance of Noise Scheduling for Diffusion Models**
    - *Chen, arXiv 2023*
    - [Paper](https://arxiv.org/abs/2301.10972)
    - **Why Read:** 深入分析噪声调度对训练和采样的影响
    - **Key Concepts:** Noise schedule design, signal-to-noise ratio, training stability
    - **Discussion:** 参见我们的问题 [如何使噪声调度在实践中有更好的效果？](question-discussions/empirical-questions/hyperparameter-effects.md)

---

## 6️⃣ Advanced Topics | 进阶主题

### Conditional Generation & Guidance

16. 🌟 **Classifier-Free Diffusion Guidance**
    - *Ho & Salimans, NeurIPS 2022 Workshop*
    - [Paper](https://arxiv.org/abs/2207.12598)
    - **Why Read:** 无需额外分类器的条件生成方法
    - **Key Concepts:** Classifier-free guidance, unconditional training, guidance scale

17. 🔬 **GLIDE: Towards Photorealistic Image Generation and Editing with Text-Guided Diffusion Models**
    - *Nichol et al., ICML 2022*
    - [Paper](https://arxiv.org/abs/2112.10741)
    - **Why Read:** 文本引导生成的重要实践
    - **Key Concepts:** Text conditioning, CLIP guidance, inpainting

### Consistency Models & Alternatives

18. 🔥 **Consistency Models**
    - *Song et al., ICML 2023*
    - [Paper](https://arxiv.org/abs/2303.01469)
    - **Why Read:** 新的生成模型范式，单步生成
    - **Key Concepts:** Consistency function, self-consistency, distillation

---

## 7️⃣ Mathematical Foundations (Deep Dive) | 深度数学基础

### Stochastic Processes & SDEs

19. 🔬 **An Introduction to Stochastic Differential Equations**
    - *Evans, 2013 (Textbook excerpt)*
    - **Why Read:** 理解 SDE-based diffusion models 的必备数学背景
    - **Key Concepts:** Itô calculus, Fokker-Planck equation, reverse-time SDEs

### Optimal Transport

20. 🔬 **Diffusion Schrödinger Bridge with Applications to Score-Based Generative Modeling**
    - *De Bortoli et al., NeurIPS 2021*
    - [Paper](https://arxiv.org/abs/2106.01357)
    - **Why Read:** 将扩散模型与最优传输理论联系
    - **Key Concepts:** Schrödinger bridge, entropy-regularized OT, iterative proportional fitting

---

## 📖 Recommended Reading Order | 推荐阅读顺序

### Track 1: Foundation to Practice (初学者路径)
1 → 2 → 5 → 8 → 10 → 16

### Track 2: Deep Theory (理论研究路径)
1 → 3 → 4 → 7 → 8 → 9 → 13

### Track 3: Advanced & Cutting-Edge (进阶路径)
(Complete Track 1 first) → 11 → 12 → 14 → 15 → 18 → 20

---

## 🔗 Additional Resources | 额外资源

### Tutorials & Courses
- [**What are Diffusion Models?**](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/) - Lilian Weng's excellent blog post
- [**The Annotated Diffusion Model**](https://huggingface.co/blog/annotated-diffusion) - HuggingFace tutorial
- [**Score-Based Generative Models (Tutorial)**](https://yang-song.net/blog/2021/score/) - Yang Song's blog

### Code Implementations
- [openai/guided-diffusion](https://github.com/openai/guided-diffusion) - Official DDPM/ADM implementation
- [yang-song/score_sde_pytorch](https://github.com/yang-song/score_sde_pytorch) - Score-based SDE models
- [NVlabs/edm](https://github.com/NVlabs/edm) - EDM official implementation

---

## 💡 How to Use This List | 使用建议

1. **选择合适的路径**：根据你的背景选择 Foundation、Theory 或 Advanced 路径
2. **主动提问**：阅读过程中的困惑请在我们的 [Issues](https://github.com/Shiying-Zhang/diffusion-theory-discussion/issues) 中提出
3. **做笔记**：考虑在 `Notes/` 文件夹中记录你的理解和疑问
4. **参与讨论**：欢迎在相关问题讨论中分享你的见解

---

## 🤝 Contribute | 贡献

发现好论文？欢迎通过 Pull Request 添加，或在 [Issues](https://github.com/Shiying-Zhang/diffusion-theory-discussion/issues) 中推荐！

**贡献格式：**
```markdown
- **Paper Title**
  - *Authors, Venue Year*
  - [Paper](link)
  - **Why Read:** 简短说明
  - **Key Concepts:** 核心概念
```

---

**Last Updated:** 2025-12-01 | **Maintainers:** Diego & Shiying
