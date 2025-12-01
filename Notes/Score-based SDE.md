# Score-Based Generative Modeling through Stochastic Diffusion Equations(Score-Based SDE)

Author: Zichang Wang

本笔记旨在是阐释论文背后的数学直观，在阅读完论文后观看以获得最佳体验。

## 符号定义

样本分布函数$q(x_0)$，是我们还原的目标。

$T$为前向过程（以及反向过程）的总步数。

前向过程$q(x_t|x_{t-1})$.

反向过程$p_\theta(x_{t-1}|x_t)$，其中$\theta$为模型参数。

参数：

- $\alpha_t$为一列略小于$1$的参数
- $\beta_t = 1 - \alpha_t$为一列略大于$0$的参数
- $\bar{\alpha}_t = \prod_{i=1}^t \alpha_i$为累计衰减，希望$t=T$时接近$0$

## 前向过程

Markov链，每一步转移概率为$q(x_t|x_{t-1})\sim N(\sqrt{1-\beta_t}x_{t-1},\beta_t I)$. 这等价于：
$$
X_t=\sqrt{1-\beta_t}X_{t-1}+\sqrt{\beta_t}\epsilon,
$$
其中$\epsilon\sim N(0,I)$与$X_{t-1}$独立。

这里$\beta_t$是人为取定的加噪参数，越大代表遗忘信息越多，步子迈的越大，考虑还原时情况，所以直观上应取成其在$t$小的时候较小，$t$大的时候较大。

为了推导方便，容易看出我们有：
$$
X_t=\sqrt{\prod_{i=1}^{t}(1-\beta_{i})}X_0+\sqrt{1-\prod_{i=1}^{t}(1-\beta_{i})}\epsilon=\sqrt{\bar{\alpha}_t}X_0+\sqrt{1-\bar{\alpha}_t}\epsilon,
$$
其中$\epsilon\sim N(0,I)$与$X_0$独立。

> Q：$X_{t-1}$前的系数$\sqrt{1-\beta_t}$是重要的吗？替换成$1-\beta_t$如何？
>
> A：是重要的，这保证了归一化。

## 反向过程

### 形态假设

我们要求反向过程也是一个Markov链，但需要学习：

$$
p_\theta(x_{t-1}|x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \Sigma_\theta(x_t, t)).
$$

### Loss

我们希望minimize最终的输出分布$p_\theta(x_0)$和真实分布$q(x_0)$之间的KL散度：

$$
D_{KL}(p_\theta(x_0)||q(x_0))=\mathbb{E}_{q(x_0)}[-\log p_\theta(x_0)]+C,
$$
其中$C=\mathbb{E}_{q(x_0)}[\log q(x_0)]$与$\theta$无关。

对$\log$函数使用Jenson不等式，因为
$$
\log p_\theta(x_0)=\log \int q(x_{1:T}|x_0)\frac{p_\theta(x_{0:T})}{q(x_{1:T}|x_0)}{\rm d}x_{1:T},
$$
 所以我们有估计
$$
\mathbb{E}_{q(x_0)}[-\log p_\theta(x_0)]\leq \mathbb{E}_q\left[-\log\frac{p_\theta(x_{0:T})}{q(x_{1:T}|x_0)}\right]=:L.
$$
后者定义为我们希望minimize的Loss $L$.

事实上，$L$可以化简为
$$
L=\mathbb{E}_q\left[D_{KL}(q(x_T|x_0)||p(x_T))+\sum_{t=1}^{T-1}D_{KL}(q(x_t|x_{t+1},x_0)||p_\theta(x_t|x_{t+1}))-\log p_\theta(x_0|x_1)\right],
$$
为了方便我们

## 实际训练Loss

### 训练目标推导

从$L_t$的表达式出发，其中真实后验均值为：

$$\tilde{\mu}_t(x_t, x_0) = \frac{\sqrt{\bar{\alpha}_{t-1}}\beta_t}{1-\bar{\alpha}_t}x_0 + \frac{\sqrt{\alpha_t}(1-\bar{\alpha}_{t-1})}{1-\bar{\alpha}_t}x_t$$

将$x_t = \sqrt{\bar{\alpha}_t}x_0 + \sqrt{1-\bar{\alpha}_t}\epsilon$代入，可以重写为：

$$\tilde{\mu}_t = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}}\epsilon\right)$$

因此，如果我们让模型预测噪声$\epsilon$，可以设定：

$$\mu_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}}\epsilon_\theta(x_t, t)\right)$$

最终训练目标简化为：

$$L_{simple} = \mathbb{E}_{t,x_0,\epsilon}\left[\|\epsilon - \epsilon_\theta(\sqrt{\bar{\alpha}_t}x_0 + \sqrt{1-\bar{\alpha}_t}\epsilon, t)\|^2\right]$$

**核心思想**：模型$\epsilon_\theta$学习预测添加到数据中的噪声$\epsilon$。




### 速度

使用Numpy，大约每秒可以生成$10^6$量级的一维正态随机变量。则使用DDPM生成一张$32\times 32$的图片大约需要
$$
32\times 32\times 1000\div 10^6 = 1
$$
秒（不加声明，等号指左右两侧具有相同数量级）。

？？？

关键：所有的步骤需要迭代处理而非并行，所以时间较慢。

