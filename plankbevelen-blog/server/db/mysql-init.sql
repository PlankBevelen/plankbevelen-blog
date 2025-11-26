-- Create database
CREATE DATABASE IF NOT EXISTS `plankbevelen-blog`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `plankbevelen-blog`;

-- Categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Articles table
CREATE TABLE IF NOT EXISTS `articles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `tags` VARCHAR(512) NULL,
  `category_id` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed categories
INSERT INTO `categories` (`name`) VALUES
  ('基础知识'),        -- 基础语法、数据类型、运算符、流程控制等
  ('工程化&工具'),      -- Webpack/Vite、TS、ESLint、CI/CD、Monorepo等
  ('跨端开发'),         -- 小程序、Taro、UniApp、Electron、React Native等
  ('性能优化'),         -- 加载/渲染/运行时优化、首屏优化、性能监控等
  ('前端框架原理'),     -- 虚拟DOM、响应式、组件化、编译原理等
  ('可视化&交互'),      -- Canvas、SVG、Three.js、动效、用户体验等
  ('前端工程实践')     -- 项目架构、代码规范、状态管理、权限控制等
