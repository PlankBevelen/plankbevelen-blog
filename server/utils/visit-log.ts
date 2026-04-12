import dayjs from 'dayjs'
import type { Db, Filter } from 'mongodb'
import type { VisitLogDoc } from './mongo'
import { getCollections, getDb } from './mongo'

export type VisitLogSearch = {
  days?: number
  keyword?: string
  deviceType?: string
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildVisitLogMatch(search: VisitLogSearch = {}): Filter<VisitLogDoc> {
  const days = Math.min(90, Math.max(1, Number(search.days || 7)))
  const match: Filter<VisitLogDoc> = {
    visitedAt: {
      $gte: dayjs().subtract(days - 1, 'day').startOf('day').toDate()
    }
  }

  const keyword = String(search.keyword || '').trim()
  if (keyword) {
    const pattern = new RegExp(escapeRegex(keyword), 'i')
    match.$or = [
      { path: pattern },
      { fullPath: pattern },
      { ip: pattern },
      { browser: pattern },
      { os: pattern },
      { referer: pattern }
    ]
  }

  if (search.deviceType && search.deviceType !== 'all') {
    match.deviceType = search.deviceType as VisitLogDoc['deviceType']
  }

  return match
}

export async function getVisitLogSummary(search: VisitLogSearch = {}, dbInstance?: Db) {
  const db = dbInstance || getDb()
  const { visitLogs } = getCollections(db)
  const match = buildVisitLogMatch(search)
  const todayStart = dayjs().startOf('day').toDate()

  const [result] = await visitLogs
    .aggregate([
      { $match: match },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalVisits: { $sum: 1 },
                uniqueIps: { $addToSet: '$ip' },
                averageDurationMs: { $avg: '$durationMs' },
                latestVisitedAt: { $max: '$visitedAt' },
                todayVisits: {
                  $sum: {
                    $cond: [{ $gte: ['$visitedAt', todayStart] }, 1, 0]
                  }
                }
              }
            }
          ],
          topPaths: [
            {
              $group: {
                _id: '$path',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 0,
                path: '$_id',
                count: 1
              }
            }
          ],
          devices: [
            {
              $group: {
                _id: '$deviceType',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1, _id: 1 } },
            {
              $project: {
                _id: 0,
                deviceType: '$_id',
                count: 1
              }
            }
          ]
        }
      }
    ])
    .toArray()

  const totals = result?.totals?.[0]

  return {
    totalVisits: Number(totals?.totalVisits || 0),
    uniqueVisitors: Array.isArray(totals?.uniqueIps) ? totals.uniqueIps.filter(Boolean).length : 0,
    averageDurationMs: Math.round(Number(totals?.averageDurationMs || 0)),
    todayVisits: Number(totals?.todayVisits || 0),
    latestVisitedAt: totals?.latestVisitedAt || null,
    topPaths: result?.topPaths || [],
    deviceDistribution: result?.devices || []
  }
}
