---
title: 解决Windows Arm64无法升级到Future Platforms的问题
published: 2026-08-23
description: "通过禁用Windows容器平台, 解决Windows Arm64进行升级到新Windows Insider (Future Platforms)时失败的问题"
image: ""
tags: ["Windows"]
category: "与Windows的爱恨情仇"
draft: false
lang: "zh_CN"
validityCheck: true
---

如果你是 Windows Arm64 的用户, 在升级到最新 `Insider` (`Future Platforms`)时一般会在 `SafeOS` 阶段, 进度条到 `60%` 的时候掉电重启, 并且升级失败代码为`0xc1900101`。

这是 Windows 在 Arm64 上一些系统组件的缺陷, 不过好消息是你可以先把涉及到的组件移除, 之后即可顺利升级。

## 致因

一般来说, 升级到 `60%` 即为第二次重启后, 系统环境已经进入新系统的环境, 并且此时 `DISM` 开始配置新系统组件。

如果你比较细心, 在升级失败后会发现Windows在新系统的临时安装目录 `C:\$WINDOWS.~BT` 下留存了一些文件, 其中就包括对我们来说最主要的错误日志文件: `C:\$WINDOWS.~BT\Sources\Panther\setuperr.log`。

之后我们可以来对此文件内记录的错误进行分析, 进而恢复错误根源。

研究发现, Windows 组件服务（`CBS`）的容器组件安装器（`containerworker.exe`, 版本为 `10.0.29648.1000`, 为新系统的服务组件）在为新系统重建"容器客体基础镜像层"(涉及 `Containers-Client-Guest-Package`、`HyperV-Guest-KernelInt-Package` 等包, 目标目录 `C:\ProgramData\Microsoft\Windows\Containers\Layers\...`) 时崩溃 (`0x800700FF`, `RtlFailFast`), 返回错误 `255`。

容器层发生了不可忽略的错误, 于是`CBS` 报告 `ERROR_ADVANCED_INSTALLER_FAILED` (`0x80073713`), 进而触发更新回滚。

## 解决方案

既然致因是容器层, 那我们只需要禁用相关组件即可。

可以使用

```pwsh
optionalfeatures
```

打开图形化的"启用或关闭 Windows 功能", 之后取消勾选:

- Windows 沙盒
- 容器

完成后重启, 即可解决。

当然你可能不喜欢图形化界面, 也可以使用如下的Powershell命令:

```pwsh
# Windows Sandbox
Disable-WindowsOptionalFeature -Online -FeatureName Containers-DisposableClientVM -NoRestart
# Container
Disable-WindowsOptionalFeature -Online -FeatureName Containers -NoRestart
# And restart your computer
Restart-Computer
```

做完这些后, 你的Windows Arm64设备应该就能正常进行升级到`Future Platforms`了。
