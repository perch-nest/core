// What makes this copy of the protocol a particular project's: where its website lives (passkeys are made for RP_ID,
// and its computers accept sign-ins from APP_ORIGIN), and its own meeting points on the public brokers.
//
// This is the only file in protocol/ a project changes. scripts/sync-core.mjs copies every other file from Perch
// Nest's core unchanged and never touches this one. The values below are core's own, for its tests.
//
//   Perch:  https://just-rice.github.io      /perch/   'perch/v1/'  'perch-'
//   Roost:  https://faarisaahmed.github.io   /roost/   'roost/v1/'  'roost-'
export const APP_ORIGIN = 'https://perch-nest.github.io';
export const RP_ID = 'perch-nest.github.io';
export const SITE_URL = 'https://perch-nest.github.io/';
export const CONNECT_URL = 'https://perch-nest.github.io/connect.html';
// Topics under this prefix are this project's: a viewer of one project never finds a computer of the other by accident.
export const TOPIC_PREFIX = 'nest/v1/';
// MQTT client ids start with this (only seen by the brokers).
export const CLIENT_PREFIX = 'nest-';
