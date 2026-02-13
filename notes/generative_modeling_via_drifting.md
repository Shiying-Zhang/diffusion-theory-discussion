# Generative Modeling via Drifting

Notes Author: Zichang Wang

本笔记旨在是阐释论文背后的数学直观，在阅读完论文后观看以获得最佳体验。

## 符号定义

样本分布函数$q$，是我们还原的目标。

模型第$n$步时神经网络给出的映射为$f_{\theta,n}:\mathbb{R}^N\to\mathbb{R}^N$.

令$p_{\theta,0}=p_0$为标准高斯分布，$f_{\theta,0}=Id$为恒等映射，记$p_{\theta,n}=\left (f_{\theta,n}\right)_*p_0$为推前概率分布，在没有歧义时，用$f_n$代指$f_{\theta,n}$，用$p_n$代指$p_{\theta,n}$.

## 训练流程

假设已经得到$f_n$，冻结住$f_n$不变，现在来求$f_{n+1}$.

首先从$p_n$和$q$里sample足够多次，得到Drifting Field的一个近似$V_{p_n,q}$，然后minimize如下loss
$$
L=\mathbb{E}_{p_0}\left[||f_{\theta,n+1}(X)-(f_n(X)+V_{p_n,q})||^2\right]
$$


