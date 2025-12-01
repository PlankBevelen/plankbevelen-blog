import { setResponseStatus, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const [articleRes, categoryRes, tagRes, latestRes]: any[] = await Promise.all([
      $fetch('/api/article', { params: { page: 1, limit: 10 }, key: 'articles-list' }),
      $fetch('/api/category'),
      $fetch('/api/tag'),
      $fetch('/api/article', { params: { page: 1, limit: 5, sort: 'created' }, key: 'latest-articles' }),
    ])

    const articles = (articleRes?.data || [])
    const categories = (categoryRes?.data || [])
    const tags = (tagRes?.data || [])
    const articleCount = Number(articleRes?.total || 0)
    const latestArticles = ((latestRes?.data || []) as any[]).map((r: any) => ({
      title: r.title,
      category: r.category,
      createTime: r.createTime,
      id: r.id
    }))

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: '查询成功',
      data: {
        articles,
        categories,
        tags,
        latestArticles,
        stats: {
          articles: articleCount,
          categories: (categories || []).length,
          tags: (tags || []).length,
        }
      }
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误' + (error?.message || '未知错误'), data: null }
  }
})
