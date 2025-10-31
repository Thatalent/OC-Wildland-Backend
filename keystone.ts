// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from '@keystone-6/core'
import { lists } from './schema'
import { withAuth, session } from './auth'
import dotenv from 'dotenv'
import { mergeSchemas } from '@graphql-tools/schema'

dotenv.config()

console.log('DATABASE_URL:', process.env.DATABASE_URL)

export default withAuth(
  config({
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL || 'DATABASE_URL_TO_REPLACE',
    },
    lists,
    session,
    extendGraphqlSchema: (schema) => {
      const { addResolversToSchema } = require('@graphql-tools/schema')
      const { gql } = require('graphql-tag')

      const typeDefs = gql`
        type ConsultationAvailability {
          date: String!
          bookedCount: Int!
          bookedTimes: [String!]!
        }

        extend type Query {
          consultationsAvailability(start: String!, end: String!): [ConsultationAvailability!]!
          bookedTimesForDate(date: String!): [String!]!
        }
      `

      const extended = mergeSchemas({
        schemas: [schema],
        typeDefs: [typeDefs],
      })

      const resolvers = {
        Query: {
          consultationsAvailability: async (_root: any, { start, end }: any, context: any) => {
            try {
              const rows = await context.db.Consultation.findMany({
                where: {
                  selectDate: { gte: start, lte: end },
                },
                query: 'selectDate preferredTime',
              })
              const map = new Map<string, Set<string>>()
              rows.forEach((r: any) => {
                const raw = r.selectDate
                const t = r.preferredTime
                if (raw == null) return
                let dateStr: string | null = null
                if (typeof raw === 'number') {
                  dateStr = new Date(raw).toISOString().slice(0, 10)
                } else if (typeof raw === 'string') {
                  if (/^\d+$/.test(raw)) {
                    dateStr = new Date(Number(raw)).toISOString().slice(0, 10)
                  } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                    dateStr = raw
                  } else {
                    const parsed = Date.parse(raw)
                    if (!Number.isNaN(parsed)) dateStr = new Date(parsed).toISOString().slice(0, 10)
                    else dateStr = String(raw)
                  }
                } else if (raw instanceof Date) {
                  dateStr = raw.toISOString().slice(0, 10)
                } else {
                  dateStr = String(raw)
                }
                if (!dateStr) return
                if (!map.has(dateStr)) map.set(dateStr, new Set())
                if (t) map.get(dateStr)!.add(t)
              })
              return Array.from(map.entries()).map(([date, set]) => ({
                date,
                bookedCount: set.size,
                bookedTimes: Array.from(set),
              }))
            } catch (err) {
              console.error('[resolver] consultationsAvailability error', err)
              throw err
            }
          },
          bookedTimesForDate: async (_root: any, { date }: any, context: any) => {
            try {
              const rows = await context.db.Consultation.findMany({
                where: { selectDate: { equals: date } },
                query: 'preferredTime',
              })
              return (rows || []).map((r: any) => r.preferredTime).filter(Boolean)
            } catch (err) {
              console.error('[resolver] bookedTimesForDate error', err)
              throw err
            }
          },
        },
      }

      return addResolversToSchema({ schema: extended, resolvers, updateResolversInPlace: false })
    },
  })
)
