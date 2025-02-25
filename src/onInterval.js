import { handleInactiveClose } from './handleInactiveClose.js'
import { handleReactionClose } from './handleReactionClose.js'
/**
 * @typedef {import('./logger.js').Logger} Logger
 * @typedef {import('discord.js').AnyThreadChannel} AnyThreadChannel
 * @typedef {import('discord.js').ForumChannel} ForumChannel
 * @typedef {import('./forum.js').Forum} Forum
 * @typedef {import('./forum.js').ForumChannelSetting} ForumChannelSetting
 */

/**
 * @param {Logger} logger
 * @param {Forum[]} forums
 */
export async function onInterval(logger, forums) {
  logger.info('Start')

  await Promise.all(
    forums.map(forum =>
      onIntervalForForum(logger.createChild(`Forum:${forum.setting.id}`), forum)
    )
  )

  logger.info(`Done`)
}

/**
 * @param {Logger} logger
 * @param {Forum} param1
 */
async function onIntervalForForum(logger, { channel, setting }) {
  const guildActiveThreads = await channel.guild.channels.fetchActiveThreads(
    false
  )
  const activeThreads = guildActiveThreads.threads.filter(
    thread => thread.parentId === channel.id
  )

  logger.info(`Found ${activeThreads.size} active threads`)

  const inactiveDurationDay = 2
  await Promise.all(
    activeThreads
      .filter(thread => !thread.locked)
      .map(thread => [
        handleInactiveClose(
          logger.createChild(`handleInactiveClose:${thread.id}`),
          setting,
          thread,
          inactiveDurationDay
        ),
        handleReactionClose(
          logger.createChild(`handleReactionClose:${thread.id}`),
          setting,
          thread
        ),
      ])
      .flat()
  )
}
