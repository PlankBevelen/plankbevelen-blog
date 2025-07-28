-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `plankbevelen-blog` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `plankbevelen-blog`;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nickname` varchar(50) NOT NULL COMMENT '用户昵称',
  `email` varchar(100) NOT NULL COMMENT '用户邮箱',
  `password` varchar(255) NOT NULL COMMENT '用户密码（加密后）',
  `avatar` varchar(255) DEFAULT NULL COMMENT '用户头像URL',
  `status` tinyint(1) DEFAULT 1 COMMENT '用户状态：1-正常，0-禁用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nickname` (`nickname`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 创建文章表
CREATE TABLE IF NOT EXISTS `articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '文章标题',
  `content` longtext NOT NULL COMMENT '文章内容',
  `summary` text COMMENT '文章摘要',
  `cover_image` varchar(255) DEFAULT NULL COMMENT '封面图片URL',
  `author_id` int(11) NOT NULL COMMENT '作者ID',
  `category_id` int(11) DEFAULT NULL COMMENT '分类ID',
  `tags` json DEFAULT NULL COMMENT '标签（JSON数组）',
  `status` tinyint(1) DEFAULT 1 COMMENT '文章状态：1-发布，0-草稿，-1-删除',
  `view_count` int(11) DEFAULT 0 COMMENT '浏览次数',
  `like_count` int(11) DEFAULT 0 COMMENT '点赞次数',
  `comment_count` int(11) DEFAULT 0 COMMENT '评论次数',
  `is_top` tinyint(1) DEFAULT 0 COMMENT '是否置顶：1-是，0-否',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_top` (`is_top`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_articles_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 创建分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `description` text COMMENT '分类描述',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序顺序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 创建评论表
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL COMMENT '文章ID',
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID（可为空，支持匿名评论）',
  `parent_id` int(11) DEFAULT NULL COMMENT '父评论ID（用于回复）',
  `content` text NOT NULL COMMENT '评论内容',
  `author_name` varchar(50) DEFAULT NULL COMMENT '评论者姓名（匿名评论时使用）',
  `author_email` varchar(100) DEFAULT NULL COMMENT '评论者邮箱（匿名评论时使用）',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-正常，0-待审核，-1-删除',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_comments_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 插入默认分类
INSERT INTO `categories` (`name`, `description`, `sort_order`) VALUES
('技术分享', '技术相关的文章分类', 1),
('生活随笔', '生活感悟和随笔', 2),
('学习笔记', '学习过程中的笔记和总结', 3);

-- 插入测试用户（密码为：123456，已加密）
INSERT INTO `users` (`nickname`, `email`, `password`) VALUES
('管理员', 'admin@example.com', '$2b$10$rQZ8kHWKQVnqVQZ8kHWKQOvQZ8kHWKQVnqVQZ8kHWKQOvQZ8kHWKQO');