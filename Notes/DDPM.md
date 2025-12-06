# Denoising Diffusion Probabilistic Models (DDPM)

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
D_{KL}(q(x_0)\|p_\theta(x_0))=\mathbb{E}_{q(x_0)}[-\log p_\theta(x_0)]+C,
$$
其中$C=\mathbb{E}_{q(x_0)}[\log q(x_0)]$与$\theta$无关。

> Recall：$p(x)$和$q(x)$的KL散度定义为$D_{KL}(q\|p)=\mathbb{E}_q\left[-\log \dfrac{p(x)}{q(x)}\right]$测量了在真实分布$q$时使用近似分布$p$带来的额外惊喜。

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
L=\mathbb{E}_q\left[D_{KL}(q(x_T|x_0)\|p(x_T))+\sum_{t=1}^{T-1}D_{KL}(q(x_t|x_{t+1},x_0)\|p_\theta(x_t|x_{t+1}))-\log p_\theta(x_0|x_1)\right],
$$
为了方便，记$L_t=\mathbb{E}_q[D_{KL}(q(x_t|x_{t+1},x_0)||p_\theta(x_t|x_{t+1}))]$，我们有表达式
$$
q(x_t|x_{t+1},x_0)\sim N\left(\dfrac{\sqrt{\bar{\alpha}_t}\beta_{t+1}}{1-\bar{\alpha}_{t+1}}x_0+\dfrac{\sqrt{\alpha_{t+1}}(1-\bar{\alpha}_t)}{1-\bar{\alpha}_{t+1}}x_{t+1},\dfrac{1-\bar{\alpha}_t}{1-\bar{\alpha}_{t+1}}\beta_{t+1}I\right)
$$

> $t$越大，受到$x_{t+1}$影响越大；反之，$x_0$.

**定理：**两个高斯分布$Q\sim N(\mu_1,\sigma_1)$, $P\sim N(\mu_2,\sigma_2)$的KL散度为
$$
D_{KL}(Q \| P) = \frac{1}{2} \left[ \log \left( \frac{\sigma_2^2}{\sigma_1^2} \right) + \frac{\sigma_1^2}{\sigma_2^2} + \frac{(\mu_1 - \mu_2)^2}{\sigma_2^2} - 1 \right]
$$

这个表达式告诉我们，如果我们不控制模型方差，那么取一个非常大的方差$\sigma_2$对模型来说是一个Loss很小的退化解，我们不希望这种事情发生。所以我们需要归一化模型方差进行训练。

### 实际训练Loss

于是我们取定，$\Sigma_\theta(x_t, t)=\sigma_t^2I$，$\sigma_t\sim\beta_t$为同量级固定常数。

则
$$
L_{t-1}=\mathbb{E}_q\left[\frac{1}{2\sigma_t^2}\left\|\tilde{\mu}_t(x_t,x_0)-\mu_\theta(x_t,t)\right\|^2\right]+C,
$$
其中$\tilde{\mu}_t(x_t, x_0) = \frac{\sqrt{\bar{\alpha}_{t-1}}\beta_t}{1-\bar{\alpha}_t}x_0 + \frac{\sqrt{\alpha_t}(1-\bar{\alpha}_{t-1})}{1-\bar{\alpha}_t}x_t$为后验均值。

为了摆脱期望的复杂下标$q$，我们做恒等变形
$$
x_t = \sqrt{\bar{\alpha}_t}x_0 + \sqrt{1-\bar{\alpha}_t}\epsilon,
$$
其中$\epsilon\sim N(0,1)$为独立正态变量，我们改为让模型预测$\epsilon_\theta(x_t,t)$，最后取
$$
\mu_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}}\epsilon_\theta(x_t, t)\right)
$$
即可。此时，Loss化简为
$$
L_{t-1}=\mathbb{E}_{q(x_0),\epsilon}\left[\|\epsilon - \epsilon_\theta(\sqrt{\bar{\alpha}_t}x_0 + \sqrt{1-\bar{\alpha}_t}\epsilon, t)\|^2\right].
$$

### Score

和直观相符，这个$-\epsilon$正好就是概率分布$q(x_t|x_0)$的Score（差一个常数倍）。

> Recall：一个概率分布$p(x)$的Score定义为$\nabla_x p(x)$.

**定理：**在Loss的表达式中，
$$
\nabla_{x_t}q(x_t|x_0)=-\frac{\epsilon}{\sqrt{1-\bar{\alpha}_t}}
$$
这是一个直接的Gauss变量密度函数的计算。所以训练每个$L_{t-1}$的过程实际上就是一个梯度下降。

关于更多Score的Motivation，可以参考Yang Song写过的非常详细的一篇[blog](https://yang-song.net/blog/2021/score/)。
