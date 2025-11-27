-- Create database
CREATE DATABASE IF NOT EXISTS `plankbevelen-blog`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `plankbevelen-blog`;
SET time_zone = '+08:00';

-- Categories table（补充索引：分类名唯一索引、创建/更新时间普通索引）
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- 主键索引（默认已创建，显式标注更清晰）
  PRIMARY KEY (`id`),
  -- 分类名唯一索引：避免重复分类，同时加速按分类名查询
  UNIQUE KEY `uk_category_name` (`name`),
  -- 文章数索引：便于统计或按文章量排序
  KEY `idx_category_count` (`count`),
  -- 普通索引：加速按创建时间/更新时间筛选分类（如按时间排序展示分类）
  KEY `idx_category_created_at` (`created_at`),
  KEY `idx_category_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Articles table（补充索引：外键索引、时间索引、复合索引）
CREATE TABLE IF NOT EXISTS `articles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `tags` VARCHAR(512) NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- 主键索引
  PRIMARY KEY (`id`),
  -- 外键约束（保留原有）
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  -- 外键索引：加速按分类查询文章（核心查询场景，必须加）
  KEY `idx_article_category_id` (`category_id`),
  -- 时间索引：加速按创建/更新时间筛选文章（如按时间排序、筛选近期文章）
  KEY `idx_article_created_at` (`created_at`),
  KEY `idx_article_updated_at` (`updated_at`),
  -- 复合索引：优化「按分类+时间」的组合查询（如查询某分类下最新文章）
  KEY `idx_article_category_created` (`category_id`, `created_at`),
  -- 标题索引：加速按标题模糊查询（可选，根据业务需求）
KEY `idx_article_title` (`title`(64)) -- 标题过长，取前64字符建索引，平衡性能和空间
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tags table：仅以名称为主键进行计数维护（不使用外键）
CREATE TABLE IF NOT EXISTS `tags` (
  `name` VARCHAR(128) NOT NULL,
  `count` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 触发器：文章新增/更新/删除时同步维护 tags 表计数
DELIMITER $$
DROP TRIGGER IF EXISTS `tg_article_insert` $$
CREATE TRIGGER `tg_article_insert` AFTER INSERT ON `articles`
FOR EACH ROW
BEGIN
  DECLARE s TEXT;
  DECLARE tag VARCHAR(128);
  SET s = NEW.tags;
  IF s IS NULL THEN SET s = ''; END IF;
  SET s = REPLACE(TRIM(s), '，', ',');
  SET s = TRIM(BOTH ',' FROM s);
  WHILE s <> '' DO
    SET tag = SUBSTRING_INDEX(s, ',', 1);
    SET tag = TRIM(tag);
    IF tag <> '' THEN
      INSERT INTO `tags` (`name`, `count`) VALUES (tag, 1)
      ON DUPLICATE KEY UPDATE `count` = `count` + 1;
    END IF;
    IF LOCATE(',', s) = 0 THEN
      SET s = '';
    ELSE
      SET s = SUBSTRING(s, LOCATE(',', s) + 1);
    END IF;
  END WHILE;
END $$

DROP TRIGGER IF EXISTS `tg_article_update` $$
CREATE TRIGGER `tg_article_update` AFTER UPDATE ON `articles`
FOR EACH ROW
BEGIN
  DECLARE sOld TEXT;
  DECLARE sNew TEXT;
  DECLARE tag VARCHAR(128);
  SET sOld = OLD.tags; IF sOld IS NULL THEN SET sOld = ''; END IF;
  SET sNew = NEW.tags; IF sNew IS NULL THEN SET sNew = ''; END IF;
  SET sOld = REPLACE(TRIM(sOld), '，', ','); SET sOld = TRIM(BOTH ',' FROM sOld);
  SET sNew = REPLACE(TRIM(sNew), '，', ','); SET sNew = TRIM(BOTH ',' FROM sNew);

  -- 对旧标签执行减计数：旧集合中且不在新集合
  WHILE sOld <> '' DO
    SET tag = SUBSTRING_INDEX(sOld, ',', 1);
    SET tag = TRIM(tag);
    IF tag <> '' THEN
      IF FIND_IN_SET(tag, sNew) = 0 THEN
        UPDATE `tags` SET `count` = CASE WHEN `count` > 0 THEN `count` - 1 ELSE 0 END WHERE `name` = tag;
      END IF;
    END IF;
    IF LOCATE(',', sOld) = 0 THEN SET sOld = ''; ELSE SET sOld = SUBSTRING(sOld, LOCATE(',', sOld) + 1); END IF;
  END WHILE;

  -- 对新标签执行加计数：新集合中且不在旧集合
  WHILE sNew <> '' DO
    SET tag = SUBSTRING_INDEX(sNew, ',', 1);
    SET tag = TRIM(tag);
    IF tag <> '' THEN
      IF FIND_IN_SET(tag, sOld) = 0 THEN
        INSERT INTO `tags` (`name`, `count`) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE `count` = `count` + 1;
      END IF;
    END IF;
    IF LOCATE(',', sNew) = 0 THEN SET sNew = ''; ELSE SET sNew = SUBSTRING(sNew, LOCATE(',', sNew) + 1); END IF;
  END WHILE;

  -- 清理计数为 0 的标签
  DELETE FROM `tags` WHERE `count` <= 0;
END $$

DROP TRIGGER IF EXISTS `tg_article_delete` $$
CREATE TRIGGER `tg_article_delete` AFTER DELETE ON `articles`
FOR EACH ROW
BEGIN
  DECLARE s TEXT;
  DECLARE tag VARCHAR(128);
  SET s = OLD.tags;
  IF s IS NULL THEN SET s = ''; END IF;
  SET s = REPLACE(TRIM(s), '，', ',');
  SET s = TRIM(BOTH ',' FROM s);
  WHILE s <> '' DO
    SET tag = SUBSTRING_INDEX(s, ',', 1);
    SET tag = TRIM(tag);
    IF tag <> '' THEN
      UPDATE `tags` SET `count` = CASE WHEN `count` > 0 THEN `count` - 1 ELSE 0 END WHERE `name` = tag;
    END IF;
    IF LOCATE(',', s) = 0 THEN
      SET s = '';
    ELSE
      SET s = SUBSTRING(s, LOCATE(',', s) + 1);
    END IF;
  END WHILE;
  -- 清理计数为 0 的标签
  DELETE FROM `tags` WHERE `count` <= 0;
END $$
DELIMITER ;

-- 分类计数触发器：根据 articles 的增删改维护 categories.count
DELIMITER $$
DROP TRIGGER IF EXISTS `tg_article_insert_category` $$
CREATE TRIGGER `tg_article_insert_category` AFTER INSERT ON `articles`
FOR EACH ROW
BEGIN
  UPDATE `categories`
    SET `count` = `count` + 1
    WHERE `id` = NEW.category_id;
END $$

DROP TRIGGER IF EXISTS `tg_article_update_category` $$
CREATE TRIGGER `tg_article_update_category` AFTER UPDATE ON `articles`
FOR EACH ROW
BEGIN
  IF NEW.category_id <> OLD.category_id THEN
    UPDATE `categories` SET `count` = CASE WHEN `count` > 0 THEN `count` - 1 ELSE 0 END WHERE `id` = OLD.category_id;
    UPDATE `categories` SET `count` = `count` + 1 WHERE `id` = NEW.category_id;
  END IF;
END $$

DROP TRIGGER IF EXISTS `tg_article_delete_category` $$
CREATE TRIGGER `tg_article_delete_category` AFTER DELETE ON `articles`
FOR EACH ROW
BEGIN
  UPDATE `categories`
    SET `count` = CASE WHEN `count` > 0 THEN `count` - 1 ELSE 0 END
    WHERE `id` = OLD.category_id;
END $$
DELIMITER ;

-- Seed categories
INSERT INTO `categories` (`name`) VALUES
  ('基础知识'),        -- 基础语法、数据类型、运算符、流程控制等
  ('工程化&工具'),      -- Webpack/Vite、TS、ESLint、CI/CD、Monorepo等
  ('跨端开发'),         -- 小程序、Taro、UniApp、Electron、React Native等
  ('性能优化'),         -- 加载/渲染/运行时优化、首屏优化、性能监控等
  ('前端框架原理'),     -- 虚拟DOM、响应式、组件化、编译原理等
  ('可视化&交互'),      -- Canvas、SVG、Three.js、动效、用户体验等
  ('前端工程实践');     -- 项目架构、代码规范、状态管理、权限控制等
	
