// Default blob provider — wraps @nuxthub/blob. Downstream layers can
// register their own provider (e.g. S3, R2, or an OSS binding) and will
// automatically win the resolve priority over this built-in fallback.

import { blob as nuxthubBlob } from '@nuxthub/blob'
import { consola } from 'consola'

const logger = consola.withTag('blob')

export default defineNitroPlugin(() => {
  registerBlobProvider({
    name: 'nuxthub',
    storage: nuxthubBlob,
  })
  logger.info('Registered blob provider: nuxthub')
})
