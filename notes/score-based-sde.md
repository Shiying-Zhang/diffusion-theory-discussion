# Score-Based Generative Modeling through Stochastic Diffusion Equations (Score-Based SDE)

Notes Author: Zichang Wang

本笔记旨在是阐释论文背后的数学直观，在阅读完论文后观看以获得最佳体验。

## 符号定义

样本分布函数$q(x_0)$，是我们还原的目标。

模型对Score作出的近似记为$s_\theta(x_t,t)$，和DDPM文章中的$\epsilon_\theta(x_t,t)$的关系为
$$
s_\theta(x_t,t)=-\frac{\epsilon_\theta(x_t,t)}{\sqrt{1-\bar{\alpha}_t}}.
$$
参数（这里继承DDPM文章中的参数定义）：

- $\alpha_t$为一列略小于$1$的参数（并非原论文中的$\alpha_t$）
- $\beta_t = 1 - \alpha_t$为一列略大于$0$的参数
- $\bar{\alpha}_t = \prod_{i=1}^t \alpha_i$为累计衰减，希望$t=T$时接近$0$（是原论文中的$\alpha_t$）

## Why Score-Based?

在Score-Based模型之前，生成模型主要分为两类：一种是以EBM和VAE为代表的直接基于似然（Likelihood-Based）的拟合概率分布的模型；一种是以GAN为代表的隐式生成模型，其概率分布隐式地由其采样过程的模型表示。

GAN这种对抗模型并不稳定，我们先按下不表。

基于似然的模型将概率分布定义为：
$$
p_\theta(x) = \frac{f_\theta(x)}{Z_\theta},
$$
其中$Z_\theta = \int f_\theta(x) dx$是归一化参数。而$Z_\theta$在一般的模型架构中难以计算，但计算梯度或者MLE时又无可避免需要求$Z_\theta$的导数，这导致往往此类模型的模型架构都受到严重的归一化约束以方便计算$Z_\theta$，而无法自由设计。

而Score的引入，成功回避了$Z_\theta$的计算问题，定义Score为：
$$
s_\theta(x) = \nabla_x \log p_\theta(x).
$$
将上述概率分布代入公式：
$$
\nabla_x \log p_\theta(x) = \nabla_x \left( -f_\theta(x) - \log Z_\theta \right) = -\nabla_x f_\theta(x) - \underbrace{\nabla_x \log Z_\theta}_{0}.
$$
由于 $Z_\theta$ 不依赖于 $x$，它的梯度为$0$。因此，Score-Based模型完全消除了对归一化常数的依赖。我们可以直接训练一个神经网络来估计其梯度，而无需关心归一化问题。

> Rmk：看起来真实分数$\nabla_x \log p(x)$并不好采样训练，但实际上这并非困难，只要你熟悉分部积分公式。假定我们想最小化$L^2$范数
> $$
> \mathbb{E}_p[\|\nabla_x \log p(x)-s_\theta(x)\|^2],
> $$
> 那么直接展开成平方项减两倍交叉项，使用分部积分公式，可以将上述表达式整理为期望号内仅含$s_\theta$的二阶以内的项的形态，这样无论是其自身还是其对$\theta$的导数，都可以通过采样计算。

一旦我们学习到了分数函数$\nabla_x \log p(x)$，就可以通过朗之万动力学进行采样。这是一个迭代过程，通过沿着数据密度的梯度方向移动，并加入少量噪声：

$$
x_{i+1} \leftarrow x_i + \epsilon \nabla_x \log p(x_i) + \sqrt{2\epsilon} z_i
$$
其中$z_i \sim \mathcal{N}(0, I)$为独立正态分布。

可以证明，当$\epsilon\to 0$时，此过程的稳定分布收敛到$p(x)$.

## Why Noising?

上述基于Score的训练主要面临两个主要问题：
1.  **流形假设（Manifold Hypothesis）：** 真实数据通常位于高维空间中的低维流形上。在流形之外，几乎采样不到数据点，这导致无法估计出正确的分数。
2.  **全局依赖性：** 只要存在分数估计不准确的地方，就会导致全局朗之万动力学无法正确收敛。

通过为初始的概率分布不断加噪，整个概率密度会从流形的一个邻域开始逐渐扩散到整个空间。抓住扩散的时机，从大噪声开始使用朗之万动力学迭代，边迭代边减小噪声，这样便可以期待采样有效且克服了上述难题。

这种采样中，时间如果是离散的，则对应SMLD或者DDPM；如果是连续的，则对应Score-Based SDE.

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
