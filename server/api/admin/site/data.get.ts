import { defineEventHandler, setResponseStatus } from 'h3'
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import dayjs from 'dayjs'
import { getDb, getCollections } from '../../../utils/mongo'

type DirectoryStats = {
  files: number
  size: number
}

async function getDirectoryStats(targetPath: string): Promise<DirectoryStats> {
  try {
    const entries = await readdir(targetPath, { withFileTypes: true })
    let files = 0
    let size = 0

    for (const entry of entries) {
      const fullPath = join(targetPath, entry.name)
      if (entry.isDirectory()) {
        const nested = await getDirectoryStats(fullPath)
        files += nested.files
        size += nested.size
        continue
      }

      if (entry.isFile()) {
        const fileStat = await stat(fullPath)
        files += 1
        size += fileStat.size
      }
    }

    return { files, size }
  } catch {
    return { files: 0, size: 0 }
  }
}

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { articles, categories } = getCollections(db)
    const notDeleted: any = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }
    const thirtyDaysAgo = dayjs().subtract(29, 'day').startOf('day').toDate()

    const [totalArticles, categoriesList, contentMetrics, trendStats, publicStats, uploadStats, bundleStats] =
      await Promise.all([
        articles.countDocuments(notDeleted),
        categories
          .find({}, { projection: { _id: 0, name: 1, count: 1 } })
          .sort({ count: -1, id: 1 })
          .limit(8)
          .toArray(),
        articles
          .aggregate([
            { $match: notDeleted },
            {
              $group: {
                _id: null,
                articlesLast30Days: {
                  $sum: {
                    $cond: [{ $gte: ['$createdAt', thirtyDaysAgo] }, 1, 0]
                  }
                },
                averageContentLength: {
                  $avg: { $strLenCP: { $ifNull: ['$content', ''] } }
                }
              }
            }
          ])
          .toArray(),
        articles
          .aggregate([
            { $match: { ...notDeleted, createdAt: { $gte: thirtyDaysAgo } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+08:00' } },
                count: { $sum: 1 }
              }
            },
            { $project: { _id: 0, date: '$_id', count: 1 } },
            { $sort: { date: 1 } }
          ])
          .toArray(),
        getDirectoryStats(join(process.cwd(), 'public')),
        getDirectoryStats(join(process.cwd(), 'public', 'uploads')),
        getDirectoryStats(join(process.cwd(), '.output', 'public', '_nuxt'))
      ])

    const trendMap = new Map(trendStats.map((item: any) => [item.date, item.count]))
    const publishTrend = Array.from({ length: 30 }, (_, index) => {
      const date = dayjs().subtract(29 - index, 'day').format('YYYY-MM-DD')
      return {
        date,
        count: Number(trendMap.get(date) || 0)
      }
    })

    const metrics = contentMetrics[0] || {
      articlesLast30Days: 0,
      averageContentLength: 0
    }

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        traffic: {
          analyticsEnabled: false,
          statusText: '未接入实时访问埋点',
          source: '当前项目暂无 PV / UV 数据源，可后续接入 GA、Umami 或自建统计。',
          pv: null,
          uv: null
        },
        content: {
          totalArticles,
          articlesLast30Days: Number(metrics.articlesLast30Days || 0),
          averageContentLength: Math.round(Number(metrics.averageContentLength || 0))
        },
        assets: {
          publicFiles: publicStats.files,
          publicSize: publicStats.size,
          uploadFiles: uploadStats.files,
          uploadSize: uploadStats.size,
          bundleFiles: bundleStats.files,
          bundleSize: bundleStats.size
        },
        publishTrend,
        categoryStats: categoriesList.map((item: any) => ({
          name: item.name,
          value: Number(item.count || 0)
        }))
      }
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: 'server error', data: null }
  }
})
