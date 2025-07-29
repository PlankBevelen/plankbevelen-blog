-- 迁移脚本：将 avatar 字段从 varchar(255) 改为 TEXT
-- 执行时间：2024年

USE `plankbevelen-blog`;

-- 修改 avatar 字段类型
ALTER TABLE `users` MODIFY COLUMN `avatar` TEXT DEFAULT NULL COMMENT '头像数据(base64)';

-- 验证修改结果
DESCRIBE `users`;