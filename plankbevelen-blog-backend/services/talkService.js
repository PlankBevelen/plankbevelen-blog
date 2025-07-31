
class TalkService {
    // 获取全部说说
    async getAllTalk() {
        const result = await pool.promise().query(`
        SELECT t.*, u.nickname, u.avatar 
        FROM talks t 
        LEFT JOIN users u ON t.user_id = u.id 
        ORDER BY t.created_at DESC
        `);
        return result;
    }

    // 获取所有发布说说
    async getAllPublishedTalk() {
        const result = await pool.promise().query(`
        SELECT t.*, u.nickname, u.avatar 
        FROM talks t 
        LEFT JOIN users u ON t.user_id = u.id 
        WHERE t.status = 'published' 
        ORDER BY t.created_at DESC
        `);
        return result;
    }

    // 发说说
    async publish(content, status, images, user_id) {
        const user_id = userId || 1;
        const result = await pool.promise().query("INSERT INTO talks (content, status, images, user_id) VALUES (?, ?, ?, ?)", [content, status, images, user_id]);
        return result; 
    }

    // 更新说说内容
    async update(content, status, images, id) {
        const result = await pool.promise().query("UPDATE talks SET content = ?, status = ?, images = ? WHERE id = ?", [content, status, images, id]);
        return result;
    }
    
    // 检查说说是否存在
    async checkTalkExist(id) {
        const result = await pool.promise().query("SELECT * FROM talks WHERE id = ?", [id]);
        return result;
    }

    // 删除说说
    async delete(id) {
        const result = await pool.promise().query("DELETE FROM talks WHERE id = ?", [id]);
        return result;
    }
}

export default new TalkService();