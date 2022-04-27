export type Account = {
  /* Base attributes */
  /** The account idheader. */
  id: string
  /** The username of the account, not including domain. */
  username: string
  /** The Webfinger account URI. Equal to username for local users, or `username@domain` for remote users. */
  acct: string
  /** The location of the user's profile page. */
  url: string

  /* Display attributes */
  /** The profile's display name. */
  display_name: string
  /** The profile's bio / description. */
  note: string
  /** An image icon that is shown next to statuses and in the profile. */
  avatar: string
  /** A static version of the avatar. Equal to avatar if its value is a static image; different if avatar is an animated GIF. */
  avatar_static: string
  /** An image banner that is shown above the profile and in profile cards. */
  header: string
  /** A static version of the header. Equal to header if its value is a static image; different if header is an animated GIF. */
  header_static: string
  /** Whether the account manually approves follow requests. */
  locked: boolean
  /** Custom emoji entities to be used when rendering the profile. If none, an empty array will be returned. */
  emojis: Emoji[]
  /** Whether the account has opted into discovery features such as the profile directory. */
  discoverable: boolean

  /* Statistical attributes */
  /** When the account was created. (ISO 8601 Datetime) */
  created_at: string
  /** When the most recent status was posted. (ISO 8601 Datetime) */
  last_status_at: string
  /** How many statuses are attached to this account. */
  statuses_count: number
  /** The reported followers of this profile. */
  followers_count: number
  /** The reported follows of this profile. */
  following_count: number

  /* Optional attributes */
  /** Indicates that the profile is currently inactive and that its user has moved to a new account. */
  moved?: Account
  /** Additional metadata attached to a profile as name-value pairs. */
  fields?: Field[]
  /** A presentational flag. Indicates that the account may perform automated actions, may not be monitored, or identifies as a robot. */
  bot?: boolean
  /** An extra entity to be used with API methods to verify credentials and update credentials. */
  source?: Source
  /** An extra entity returned when an account is suspended. */
  suspended?: boolean
  /** When a timed mute will expire, if applicable. (ISO 8601 Datetime) */
  mute_expires_at?: string
}

export type Source = {
  /* Base attributes */
  /** Profile bio. */
  note: string
  /** Metadata about the account. */
  fields: Field[]

  /* Nullable Attributes */
  /** The default post privacy to be used for new statuses. */
  privacy: Visibility | null
  /** Whether new statuses should be marked sensitive by default. */
  sensitive: boolean | null
  /** The default posting language for new statuses. (ISO 639-1 language two-letter code) */
  language: string | null
  /** The number of pending follow requests. */
  follow_requests_count: number | null
}

export type Field = {
  /* Required attributes */
  /** The key of a given field's key-value pair. */
  name: string
  /** The value associated with the `name` key. */
  value: string

  /* Optional attributes */
  /** Timestamp of when the server verified a URL value for a rel="me” link. (ISO 8601 Datetime) */
  verified_at: string | null
}

export type Status = {
  /* Base attributes */
  /** ID of the status in the database. */
  id: string
  /** URI of the status used for federation. */
  uri: string
  /** The date when this status was created. (ISO 8601 Datetime) */
  created_at: string
  /** The account that authored this status. */
  account: Account
  /** HTML-encoded status content. */
  content: string
  /** Visibility of this status. */
  visibility: Visibility
  /** Is this status marked as sensitive content? */
  sensitive: boolean
  /** Subject or summary line, below which status content is collapsed until expanded. */
  spoiler_text: string
  /** Media that is attached to this status. */
  media_attachments: Attachment[]
  /** The application used to post this status. */
  application: Application

  /* Rendering attributes */
  /** Mentions of users within the status content. */
  mentions: Mention[]
  /** Hashtags used within the status content. */
  tags: Tag[]
  /** Custom emoji to be used when rendering status content. */
  emojis: Emoji[]

  /* Informational attributes */
  /** How many boosts this status has received. */
  reblogs_count: number
  /** How many favourites this status has received. */
  favourites_count: number
  /** How many replies this status has received. */
  replies_count: number

  /* Nullable attributes */
  /** A link to the status's HTML representation. */
  url: string | null
  /** ID of the status being replied. */
  in_reply_to_id: string | null
  /** ID of the account being replied to. */
  in_reply_to_account_id: string | null
  /** The status being reblogged. */
  reblog: Status | null
  /** The poll attached to the status. */
  poll: Poll | null
  /** Preview card for links included within status content. */
  card: Card | null
  /** Primary language of this status. (ISO 639 Part 1 two-letter language code) */
  language: string | null
  /** Plain-text source of a status. Returned instead of content when status is deleted, so the user may redraft from the source text without the client having to reverse-engineer the original text from the HTML content. */
  text: string | null

  /* Authorized user attributes */
  /** Have you favourited this status? */
  favourited?: boolean
  /** Have you boosted this status? */
  reblogged?: boolean
  /** Have you muted notifications for this status's conversation? */
  muted?: boolean
  /** Have you bookmarked this status? */
  bookmarked?: boolean
  /** Have you pinned this status? Only appears if the status is pinnable. */
  pinned?: boolean
}

export type Mention = {
  /* Required attributes */
  /** The account id of the mentioned user. */
  id: string
  /** The username of the mentioned user. */
  username: string
  /** The webfinger acct: URI of the mentioned user. Equivalent to username for local users, or `username@domain` for remote users. */
  acct: string
  /** The location of the mentioned user's profile. */
  url: string
}

export type Tag = {
  /* Base attributes */
  /** The value of the hashtag after the # sign. */
  name: string
  /** A link to the hashtag on the instance. */
  url: string

  /* Optional attributes */
  /** Usage statistics for given days. */
  history: {
    /* Required attributes */
    /** UNIX timestamp on midnight of the given day. */
    day: string
    /** the counted usage of the tag within that day. (cast from an integer) */
    uses: string
    /** the total of accounts using the tag within that day. (cast from an integer) */
    accounts: string
  }[]
}

export const Visibility = {
  public: 'public',
  unlisted: 'unlisted',
  private: 'private',
  direct: 'direct',
}
export type Visibility = keyof typeof Visibility

export type Attachment = {
  /* Required attributes */
  /** The ID of the attachment in the database. */
  id: string
  /** The type of the attachment. */
  type: AttachmentType
  /** The location of the original full-size attachment. */
  url: string
  /** The location of a scaled-down preview of the attachment. */
  preview_url: string

  /* Optional attributes */
  /** The location of the full-size original attachment on the remote website. `null` if the attachment is local */
  remote_url?: string | null
  /** Metadata returned by Paperclip. */
  // meta: Hash
  /** Alternate text that describes what is in the media attachment, to be used for the visually impaired or when media attachments do not load. */
  description?: string
  /** A hash computed by [the BlurHash algorithm](https://github.com/woltapp/blurhash), for generating colorful preview thumbnails when media has not been downloaded yet. */
  blurhash?: string
}

export const AttachmentType = {
  unknown: 'unknown',
  image: 'image',
  gifv: 'gifv',
  video: 'video',
  audio: 'audio',
}
export type AttachmentType = keyof typeof AttachmentType

export type Poll = {
  /** The ID of the poll in the database. */
  id: string
  /** When the poll ends. (ISO 8601 Datetime or null if the poll does not end) */
  expires_at: string | null
  /** Is the poll currently expired? */
  expired: boolean
  /** Does the poll allow multiple-choice answers? */
  multiple: boolean
  /** How many votes have been received. */
  votes_count: number
  /** How many unique accounts have voted on a multiple-choice poll. `null` if `multiple` is false. */
  voters_count: number | null
  /** When called with a user token, has the authorized user voted? `null` if no current user */
  voted: boolean | null
  /** When called with a user token, which options has the authorized user chosen? Contains an array of index values for `options`. null if no current user */
  own_votes: number[] | null
  /** Possible answers for the poll. */
  options: {
    title: string
    votes_count: number | null
  }[]
  /** Custom emoji to be used for rendering poll options. */
  emojis: Emoji[]
}

export type Card = {
  /* Base attributes */
  /** Location of linked resource. */
  url: string
  /** Title of linked resource. */
  title: string
  /** Description of preview. */
  description: string
  /** The type of the preview card. */
  type: CardType

  /* Optional attributes */
  /** The author of the original resource. */
  author_name?: string
  /** A link to the author of the original resource. */
  author_url?: string
  /** The provider of the original resource. */
  provider_name?: string
  /** A link to the provider of the original resource. */
  provider_url?: string
  /** HTML to be used for generating the preview card. */
  html?: string
  /** Width of preview, in pixels. */
  width?: number
  /** Height of preview, in pixels. */
  height?: number
  /** Preview thumbnail URL. */
  image?: string
  /** Used for photo embeds, instead of custom `html`. */
  embed_url?: string
  /** A hash computed by [the BlurHash algorithm](https://github.com/woltapp/blurhash), for generating colorful preview thumbnails when media has not been downloaded yet. */
  blurhash?: string
}

export const CardType = {
  link: 'link',
  photo: 'photo',
  video: 'video',
  rich: 'rich',
}
export type CardType = keyof typeof CardType

export type Emoji = {
  /* Required attributes */
  /** The name of the custom emoji. */
  shortcode: string
  /** A link to the custom emoji. */
  url: string
  /** A link to a static copy of the custom emoji. */
  static_url: string
  /** Whether this Emoji should be visible in the picker or unlisted. */
  visible_in_picker: boolean

  /* Optional attributes */
  /** Used for sorting custom emoji in the picker. */
  category?: string
}

export type Application = {
  /* Required attributes */
  /** The name of your application. */
  name: string

  /* Optional attributes */
  /** The website associated with your application. */
  website?: string
  /** Used for Push Streaming API. Returned with POST /api/v1/apps. Equivalent to PushSubscription#server_key */
  vapid_key?: string

  /* Client attributes */
  /** Client ID key, to be used for obtaining OAuth tokens */
  client_id?: string
  /** Client secret key, to be used for obtaining OAuth tokens */
  client_secret?: string
}

export type GetV1TimelinesPublicResult = Status[]
export type GetV1StatusesIdResult = Status
