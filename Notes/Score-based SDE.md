# Score-Based Generative Modeling through Stochastic Diffusion Equations (Score-Based SDE)

Author: Zichang Wang

本笔记旨在是阐释论文背后的数学直观，在阅读完论文后观看以获得最佳体验。

## 符号定义

样本分布函数$q(x_0)$，是我们还原的目标。

模型对Score作出的近似记为$s_\theta(x_t,t)$，和DDPM文章中的$\epsilon_\theta(x_t,t)$的关系为
$$
s_\theta(x_t,t)=-\frac{\epsilon_\theta(x_t,t)}{\sqrt{1-\bar{\alpha}_t}}.
$$
参数（这里继承DDPM文章中的参数定义）：

- $\alpha_t$为一列略小于$1$的参数（并非本篇文章中的$\alpha_t$）
- $\beta_t = 1 - \alpha_t$为一列略大于$0$的参数
- $\bar{\alpha}_t = \prod_{i=1}^t \alpha_i$为累计衰减，希望$t=T$时接近$0$（是本篇文章中的$\alpha_t$）

## SDE

这篇文章陈述的第一件事是：无论是SMLD还是DDPM都是如下SDE框架的离散化。

正向过程是一个$\mathbb{R}^n$中的Markov过程$X=\{X_t\}_{t=0}^{T}$，初始分布为$X_0\sim q(x_0)$，且满足扩散方程
$$
{\rm d}X_t=f(X_t,t){\rm d}t+g(t){\rm d}W_t,
$$
其中$W_t$是 $n$维标准布朗运动，$f,g$为正则性足够好的函数。

所有形如这样的过程，被称为扩散过程。

**定理(Anderson，扩散过程的可逆性)：**对于上述扩散过程$X$，如下定义的扩散过程$Y=\{Y_t\}_{t=0}^{T}$和$X$同分布：

取初始分布为$Y_T\sim X_T$，扩散方程为
$$
{\rm d}Y_t=\left[f(X_t,t)-g(t)^2\nabla_x \log p_t(x)\right]{\rm d}t+g(t){\rm d}\bar{W}_t,
$$
其中$p_t(x)$是$X_t$的密度函数，$\bar{W}_t$是反向时间布朗运动。
