import { lessonCopy } from '../../content/lesson'

/** "Tree: <screen title>[, First tree]": the accessible name of a lesson drawing. */
export const treeLabel = (title: string | undefined, suffix?: string) => lessonCopy.treeLabel([title ?? '', suffix].filter(Boolean).join(', '))
