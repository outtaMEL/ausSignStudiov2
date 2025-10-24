# 文档贡献指南

## 📁 文档结构

```
ausSignStudio-v2/
├── README.md                  # 项目主README（英文）
├── README_CN.md              # 项目主README（中文）
└── docs/                     # 所有项目文档存放位置
    ├── README.md             # 文档目录索引
    ├── .phase-template.md    # Phase 文档模板
    ├── ARCHITECTURE.md       # 系统架构文档
    ├── HOW_TO_TEST_ENGINE.md # 测试指南
    ├── PHASE1_COMPLETE.md    # Phase 1 完成总结
    ├── PHASE2_COMPLETE.md    # Phase 2 完成总结
    ├── PHASE3_COMPLETE.md    # Phase 3 完成总结
    └── PHASEX_COMPLETE.md    # 未来的 Phase 文档
```

## 📝 文档命名规范

### Phase 完成文档
- **格式**: `PHASEX_COMPLETE.md`
- **示例**: `PHASE3_COMPLETE.md`, `PHASE4_COMPLETE.md`
- **位置**: `docs/`
- **模板**: 使用 `docs/.phase-template.md` 作为模板

### 技术文档
- **格式**: `<功能名称>.md` (大写开头)
- **示例**: `ARCHITECTURE.md`, `API_DESIGN.md`
- **位置**: `docs/`

### 日期相关文档
- **格式**: `YYYY-MM-DD_<描述>.md`
- **示例**: `2024-10-24_feature-implementation.md`
- **位置**: `docs/`

## ✍️ 如何添加新文档

### 1. Phase 完成文档

```bash
# 1. 复制模板
cp docs/.phase-template.md docs/PHASE3_COMPLETE.md

# 2. 编辑文档内容
# 3. 更新 docs/README.md 中的 Phase 进度表
```

### 2. 技术文档

```bash
# 直接在 docs/ 目录创建新文档
touch docs/NEW_FEATURE.md

# 编辑后添加到 docs/README.md 的对应分类
```

## 📋 Phase 文档必备章节

Phase 完成文档应该包含以下章节（参考模板）：

1. **标题和元信息**
   - Phase 编号和名称
   - 完成日期和耗时

2. **✅ 完成情况**
   - 任务清单
   - 完成度统计

3. **📊 实现统计**
   - 代码行数
   - 代码质量指标

4. **🎯 核心功能**
   - 功能详细说明
   - 使用示例

5. **📁 文件修改**
   - 新建文件列表
   - 修改文件列表

6. **🧪 测试验证**
   - 测试清单
   - 访问链接

7. **🎓 技术实现**
   - 关键技术点
   - 代码示例

8. **🚀 下一步**
   - Phase X+1 的计划

## 🔍 文档审查清单

在提交文档前，确保：

- [ ] 文件名符合命名规范
- [ ] 文档放在正确的位置（`docs/`）
- [ ] 更新了 `docs/README.md` 的索引
- [ ] 包含了所有必要的章节
- [ ] 代码示例格式正确
- [ ] 链接都是有效的
- [ ] Markdown 格式无误

## 📊 更新文档索引

每次添加新文档后，需要更新 `docs/README.md`：

```markdown
### 项目进度
- `PHASE1_COMPLETE.md` - Phase 1: 数据模型 + 核心引擎完成总结
- `PHASE2_COMPLETE.md` - Phase 2: 快速模式改造完成总结
- `PHASE3_COMPLETE.md` - Phase 3: 三列布局完成总结  # 新增
```

同时更新 Phase 进度表：

```markdown
| Phase 3 | ✅ 完成 | [PHASE3_COMPLETE.md](./PHASE3_COMPLETE.md) | 2024-10-XX |
```

## 🎯 文档质量标准

### 好的文档应该：
- ✅ **清晰**: 结构清晰，易于阅读
- ✅ **完整**: 包含所有必要信息
- ✅ **准确**: 代码示例可运行，链接有效
- ✅ **及时**: 完成后立即编写文档
- ✅ **美观**: 使用 emoji 和格式化增强可读性

### 避免：
- ❌ 过时的信息
- ❌ 损坏的链接
- ❌ 不完整的代码示例
- ❌ 缺少上下文的说明

## 📚 参考示例

- **优秀 Phase 文档**: `docs/PHASE2_COMPLETE.md`
- **文档模板**: `docs/.phase-template.md`
- **文档索引**: `docs/README.md`

---

**记住**: 好的文档是未来的自己和团队成员最好的礼物！📖✨

