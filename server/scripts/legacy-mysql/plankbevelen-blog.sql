/*
 Navicat Premium Data Transfer

 Source Server         : localhost_mysql
 Source Server Type    : MySQL
 Source Server Version : 80018 (8.0.18)
 Source Host           : localhost:3306
 Source Schema         : plankbevelen-blog

 Target Server Type    : MySQL
 Target Server Version : 80018 (8.0.18)
 File Encoding         : 65001

 Date: 28/02/2026 22:57:25
*/

CREATE DATABASE `plankbevelen-blog`;
*/

USE `plankbevelen-blog`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `file_path` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tags` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_article_category_id`(`category_id` ASC) USING BTREE,
  INDEX `idx_article_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_article_updated_at`(`updated_at` ASC) USING BTREE,
  INDEX `idx_article_category_created`(`category_id` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_article_title`(`title`(64) ASC) USING BTREE,
  INDEX `idx_article_deleted_at`(`deleted_at` ASC) USING BTREE,
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of articles
-- ----------------------------
INSERT INTO `articles` VALUES (1, 'Web移动端适配指南', '/md/article-1.md', '移动适配', 3, '2026-02-28 14:38:51', '2026-02-28 14:56:25', NULL);
INSERT INTO `articles` VALUES (2, '一文搞懂虚拟DOM', '/md/article-2.md', '虚拟DOM', 1, '2026-02-28 14:40:32', '2026-02-28 14:56:26', NULL);
INSERT INTO `articles` VALUES (3, '从0到1：实现Vue2响应式系统核心', '/md/article-3.md', 'vue2,响应式原理', 5, '2026-02-28 14:41:58', '2026-02-28 14:56:29', NULL);
INSERT INTO `articles` VALUES (4, '从0到1：实现Vue3响应式系统核心', '/md/article-4.md', 'vue2,响应式原理', 5, '2026-02-28 14:42:38', '2026-02-28 14:56:31', NULL);
INSERT INTO `articles` VALUES (5, '一文搞懂 JS 原型链', '/md/article-5.md', 'js,原型,原型链', 1, '2026-02-28 14:46:00', '2026-02-28 14:56:35', NULL);

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_category_name`(`name` ASC) USING BTREE,
  INDEX `idx_category_count`(`count` ASC) USING BTREE,
  INDEX `idx_category_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_category_updated_at`(`updated_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, '基础知识', 2, '2025-12-01 07:06:25', '2026-02-28 14:46:00');
INSERT INTO `categories` VALUES (2, '工程化&工具', 0, '2025-12-01 07:06:25', '2025-12-08 11:19:20');
INSERT INTO `categories` VALUES (3, '跨端开发', 1, '2025-12-01 07:06:25', '2026-02-28 14:38:51');
INSERT INTO `categories` VALUES (4, '性能优化', 0, '2025-12-01 07:06:25', '2026-02-28 14:35:40');
INSERT INTO `categories` VALUES (5, '前端框架原理', 2, '2025-12-01 07:06:25', '2026-02-28 14:42:38');
INSERT INTO `categories` VALUES (6, '可视化&交互', 0, '2025-12-01 07:06:25', '2025-12-01 07:06:25');
INSERT INTO `categories` VALUES (7, '前端工程实践', 0, '2025-12-01 07:06:25', '2025-12-01 07:06:25');

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags`  (
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tags
-- ----------------------------
INSERT INTO `tags` VALUES ('js', 1);
INSERT INTO `tags` VALUES ('vue2', 2);
INSERT INTO `tags` VALUES ('原型', 1);
INSERT INTO `tags` VALUES ('原型链', 1);
INSERT INTO `tags` VALUES ('响应式原理', 2);
INSERT INTO `tags` VALUES ('移动适配', 1);
INSERT INTO `tags` VALUES ('虚拟DOM', 1);

-- ----------------------------
-- Table structure for visit_logs
-- ----------------------------
DROP TABLE IF EXISTS `visit_logs`;
CREATE TABLE `visit_logs`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_agent` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of visit_logs
-- ----------------------------
INSERT INTO `visit_logs` VALUES (1, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-16 15:23:01');
INSERT INTO `visit_logs` VALUES (2, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-16 15:24:17');
INSERT INTO `visit_logs` VALUES (3, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-16 15:31:00');
INSERT INTO `visit_logs` VALUES (4, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-16 15:31:30');
INSERT INTO `visit_logs` VALUES (5, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-16 15:31:33');
INSERT INTO `visit_logs` VALUES (6, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-16 15:38:33');
INSERT INTO `visit_logs` VALUES (7, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-16 15:38:44');
INSERT INTO `visit_logs` VALUES (8, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-16 15:38:57');
INSERT INTO `visit_logs` VALUES (9, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-18 05:34:30');
INSERT INTO `visit_logs` VALUES (10, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-18 05:35:02');
INSERT INTO `visit_logs` VALUES (11, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:09:51');
INSERT INTO `visit_logs` VALUES (12, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:11:26');
INSERT INTO `visit_logs` VALUES (13, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:36:46');
INSERT INTO `visit_logs` VALUES (14, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:49:40');
INSERT INTO `visit_logs` VALUES (15, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:49:42');
INSERT INTO `visit_logs` VALUES (16, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:52:15');
INSERT INTO `visit_logs` VALUES (17, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:54:59');
INSERT INTO `visit_logs` VALUES (18, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:58:28');
INSERT INTO `visit_logs` VALUES (19, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:58:29');
INSERT INTO `visit_logs` VALUES (20, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:58:41');
INSERT INTO `visit_logs` VALUES (21, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:59:01');
INSERT INTO `visit_logs` VALUES (22, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:59:03');
INSERT INTO `visit_logs` VALUES (23, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 12:59:03');
INSERT INTO `visit_logs` VALUES (24, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 13:00:06');
INSERT INTO `visit_logs` VALUES (25, '::1', '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 13:00:09');
INSERT INTO `visit_logs` VALUES (26, '::1', '/__nuxt_error', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 13:00:14');

SET FOREIGN_KEY_CHECKS = 1;
