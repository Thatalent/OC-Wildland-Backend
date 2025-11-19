// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'

// see https://keystonejs.com/docs/fields/overview for the full list of fields
import {
  text,
  relationship,
  password,
  timestamp,
  image,
} from '@keystone-6/core/fields'

// the document field is a more complicated field, so it has its own package
import { document } from '@keystone-6/fields-document'

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import { type Lists } from '.keystone/types'

export const lists = {
  // ===== USER =====
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      password: password({ validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
      createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    },
  }),

  // Used for storing images used in the frontend
  Image: list({
    access: allowAll,
    fields: {
      imageUrl: image({ storage: 'my_local_images' }),
      name: text({ validation: { isRequired: true } }),
      altText: text(),
    },
  }),

  Testimony: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      role: text(),
      message: text({ ui: { displayMode: 'textarea' } }),
      imageUrl: text(),
    },
  }),

  // ===== POST =====
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),

      // Rich text field for class descriptions
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),

      // Additional training class fields
      date: text({ label: 'Date' }),
      time: text({ label: 'Time' }),
      location: text({ label: 'Location' }),
      spots: text({ label: 'Spots Available' }),
      price: text({ label: 'Price' }),

      // Optional: author relationship
      author: relationship({
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineConnect: true,
        },
        many: false,
      }),

      // Optional: tags relationship (categories)
      tags: relationship({
        ref: 'Tag.posts',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
      }),
    },
  }),

  // ===== TAG =====
  Tag: list({
    access: allowAll,
    ui: {
      isHidden: true,
    },
    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
} satisfies Lists
