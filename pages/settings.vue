<template>
  <div style="padding: 0 40px; padding-bottom: 60px">
    <!-- Header -->
    <div style="padding: 40px 0 0">
      <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0">
        Settings
      </h1>
      <p style="font-size: 13px; color: #71717A; margin: 8px 0 0">
        Manage your workspace preferences, data sources, and connections
      </p>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION: Preferences                           -->
    <!-- ═══════════════════════════════════════════════ -->
    <div style="margin-top: 36px">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px">
        <Settings2 :size="15" color="#71717A" :stroke-width="2" />
        <span style="font-size: 12px; font-weight: 600; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px">Preferences</span>
      </div>

      <div style="border: 1px solid #E4E4E7; border-radius: 14px; overflow: hidden; max-width: 560px">
        <div style="padding: 20px">
          <!-- Source of truth -->
          <label style="font-size: 13px; font-weight: 600; color: #09090B; display: block; margin-bottom: 10px">
            Source of truth
          </label>
          <div style="display: flex; gap: 0; border: 1px solid #E4E4E7; border-radius: 10px; overflow: hidden; margin-bottom: 10px">
            <button
              class="sot-btn"
              :class="{ 'sot-active': sourceOfTruth === 'figma' }"
              @click="handleSourceChange('figma')"
              :disabled="prefLoading"
            >
              <svg width="14" height="14" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
                <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
                <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
                <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
                <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
              </svg>
              Figma
            </button>
            <button
              class="sot-btn"
              :class="{ 'sot-active': sourceOfTruth === 'code' }"
              @click="handleSourceChange('code')"
              :disabled="prefLoading"
            >
              <Code2 :size="14" :stroke-width="2" />
              Code
            </button>
          </div>
          <p style="font-size: 12px; color: #71717A; margin: 0; line-height: 1.5">
            <template v-if="sourceOfTruth === 'figma'">
              <strong style="color: #52525B">Figma leads.</strong> Design values are the canonical source. Code tokens that differ are flagged as drifted.
            </template>
            <template v-else>
              <strong style="color: #52525B">Code leads.</strong> Code values are the canonical source. Figma variables that differ are flagged as drifted.
            </template>
          </p>

          <!-- Saved feedback -->
          <div v-if="prefSaved" style="margin-top: 12px; padding: 8px 12px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; font-size: 12px; color: #166534; display: flex; align-items: center; gap: 6px">
            <Check :size="12" :stroke-width="3" />
            Source of truth updated. Re-run diff to apply.
          </div>
        </div>

        <!-- Re-run onboarding -->
        <div style="padding: 16px 20px; border-top: 1px solid #F0F0F1; display: flex; align-items: center; justify-content: space-between">
          <div>
            <div style="font-size: 13px; font-weight: 500; color: #09090B">Onboarding</div>
            <div style="font-size: 12px; color: #71717A; margin-top: 1px">Reconnect your sources and reconfigure</div>
          </div>
          <button class="btn-text" @click="handleResetOnboarding">
            <RotateCcw :size="13" :stroke-width="2" />
            Re-run
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION: Connections                           -->
    <!-- ═══════════════════════════════════════════════ -->
    <div style="margin-top: 36px">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px">
        <Link2 :size="15" color="#71717A" :stroke-width="2" />
        <span style="font-size: 12px; font-weight: 600; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px">Connections</span>
      </div>

      <div style="display: flex; gap: 16px; flex-wrap: wrap; max-width: 1140px">
        <!-- Figma Card -->
        <div style="border: 1px solid #E4E4E7; border-radius: 14px; overflow: hidden; flex: 1; min-width: 340px; max-width: 560px">
          <div style="padding: 20px; border-bottom: 1px solid #F0F0F1; display: flex; align-items: center; gap: 12px">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: #F4F4F5; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
              <svg width="18" height="18" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
                <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
                <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
                <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
                <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
              </svg>
            </div>
            <div style="flex: 1">
              <div style="font-size: 14px; font-weight: 600; color: #09090B">Figma</div>
              <div style="font-size: 12px; color: #71717A">Design token source</div>
            </div>
            <div v-if="connection.connected" style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E; flex-shrink: 0" />
            <div v-else style="width: 8px; height: 8px; border-radius: 50%; background: #D4D4D8; flex-shrink: 0" />
          </div>

          <!-- Connected -->
          <div v-if="connection.connected" style="padding: 20px">
            <div style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; margin-bottom: 16px">
              <div style="width: 20px; height: 20px; border-radius: 50%; background: #16A34A; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
                <Check :size="12" color="#FFFFFF" :stroke-width="3" />
              </div>
              <div style="flex: 1">
                <div style="font-size: 13px; font-weight: 600; color: #09090B">{{ connection.fileName }}</div>
                <div style="font-size: 12px; color: #71717A; margin-top: 1px">
                  {{ connection.tokenCount || 0 }} tokens
                  <template v-if="connection.lastSynced"> &middot; {{ formatDate(connection.lastSynced) }}</template>
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 8px">
              <button class="btn-primary" :disabled="syncing" @click="handleSync">
                <RefreshCw :size="13" :stroke-width="2.2" :class="{ 'animate-spin-slow': syncing }" />
                {{ syncing ? 'Syncing...' : 'Sync Now' }}
              </button>
              <button class="btn-ghost" @click="handleDisconnect">Disconnect</button>
            </div>
            <div v-if="syncResult" style="margin-top: 12px; padding: 10px 14px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; font-size: 12px; color: #166534">
              Synced {{ syncResult.tokenCount }} tokens &middot; {{ syncResult.componentCount }} components
            </div>
          </div>

          <!-- Disconnected -->
          <div v-else style="padding: 20px">
            <div style="margin-bottom: 16px">
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">Personal Access Token</label>
              <input v-model="pat" type="password" placeholder="figd_xxxxxxxxxx" class="input-field" />
              <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" style="font-size: 11px; color: #71717A; margin-top: 4px; display: inline-block; text-decoration: underline">How to get a token →</a>
            </div>
            <div style="margin-bottom: 16px">
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">Figma file URL</label>
              <input v-model="fileUrl" type="text" placeholder="https://figma.com/design/abc123/My-Design-System" class="input-field" />
            </div>
            <div v-if="error" style="margin-bottom: 12px; padding: 10px 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; font-size: 12px; color: #DC2626">{{ error }}</div>
            <button class="btn-primary" :disabled="!pat || !fileUrl || loading" @click="handleConnect">
              <Link2 :size="14" :stroke-width="2" />
              {{ loading ? 'Connecting...' : 'Connect' }}
            </button>
          </div>
        </div>

        <!-- GitHub Card -->
        <div style="border: 1px solid #E4E4E7; border-radius: 14px; overflow: hidden; flex: 1; min-width: 340px; max-width: 560px">
          <div style="padding: 20px; border-bottom: 1px solid #F0F0F1; display: flex; align-items: center; gap: 12px">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: #F4F4F5; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
              <Github :size="18" color="#52525b" />
            </div>
            <div style="flex: 1">
              <div style="font-size: 14px; font-weight: 600; color: #09090B">GitHub</div>
              <div style="font-size: 12px; color: #71717A">Code token source (Tailwind)</div>
            </div>
            <div v-if="ghConnection.connected" style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E; flex-shrink: 0" />
            <div v-else style="width: 8px; height: 8px; border-radius: 50%; background: #D4D4D8; flex-shrink: 0" />
          </div>

          <!-- Connected -->
          <div v-if="ghConnection.connected" style="padding: 20px">
            <div style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; margin-bottom: 16px">
              <div style="width: 20px; height: 20px; border-radius: 50%; background: #16A34A; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
                <Check :size="12" color="#FFFFFF" :stroke-width="3" />
              </div>
              <div style="flex: 1">
                <div style="font-size: 13px; font-weight: 600; color: #09090B">{{ ghConnection.repoOwner }}/{{ ghConnection.repoName }}</div>
                <div style="font-size: 12px; color: #71717A; margin-top: 1px">
                  {{ ghConnection.configPath }} &middot; {{ ghConnection.tokenCount || 0 }} tokens
                  <template v-if="ghConnection.lastSynced"> &middot; {{ formatDate(ghConnection.lastSynced) }}</template>
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 8px">
              <button class="btn-primary" :disabled="ghSyncing" @click="handleGhSync">
                <RefreshCw :size="13" :stroke-width="2.2" :class="{ 'animate-spin-slow': ghSyncing }" />
                {{ ghSyncing ? 'Syncing...' : 'Sync Now' }}
              </button>
              <button class="btn-ghost" @click="handleGhDisconnect">Disconnect</button>
            </div>
            <div v-if="ghSyncResult" style="margin-top: 12px; padding: 10px 14px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; font-size: 12px; color: #166534">
              Synced {{ ghSyncResult.tokenCount }} code tokens across {{ Object.keys(ghSyncResult.categories).length }} categories
            </div>
          </div>

          <!-- Disconnected -->
          <div v-else style="padding: 20px">
            <div style="margin-bottom: 16px">
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">Personal Access Token</label>
              <input v-model="ghPat" type="password" placeholder="ghp_xxxxxxxxxx" class="input-field" />
              <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" style="font-size: 11px; color: #71717A; margin-top: 4px; display: inline-block; text-decoration: underline">Generate a token (repo scope) →</a>
            </div>
            <div style="margin-bottom: 16px">
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">Repository URL</label>
              <input v-model="ghRepoUrl" type="text" placeholder="https://github.com/owner/repo" class="input-field" />
            </div>
            <div v-if="ghError" style="margin-bottom: 12px; padding: 10px 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; font-size: 12px; color: #DC2626">{{ ghError }}</div>
            <button class="btn-primary" :disabled="!ghPat || !ghRepoUrl || ghLoading" @click="handleGhConnect">
              <Link2 :size="14" :stroke-width="2" />
              {{ ghLoading ? 'Connecting...' : 'Connect' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION: Token Diff                            -->
    <!-- ═══════════════════════════════════════════════ -->
    <div v-if="connection.connected && ghConnection.connected" style="margin-top: 36px">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px">
        <GitCompareArrows :size="15" color="#71717A" :stroke-width="2" />
        <span style="font-size: 12px; font-weight: 600; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px">Token Diff</span>
      </div>

      <div style="border: 1px solid #E4E4E7; border-radius: 14px; overflow: hidden; max-width: 560px">
        <div style="padding: 20px">
          <!-- Diff summary grid -->
          <div v-if="diffSummary" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px">
            <div style="text-align: center; padding: 10px; background: #F0FDF4; border-radius: 8px">
              <div style="font-size: 20px; font-weight: 700; color: #16A34A">{{ diffSummary.synced }}</div>
              <div style="font-size: 11px; color: #71717A; margin-top: 2px">Synced</div>
            </div>
            <div style="text-align: center; padding: 10px; background: #FFFBEB; border-radius: 8px">
              <div style="font-size: 20px; font-weight: 700; color: #D97706">{{ diffSummary.drifted }}</div>
              <div style="font-size: 11px; color: #71717A; margin-top: 2px">Drifted</div>
            </div>
            <div style="text-align: center; padding: 10px; background: #FEF2F2; border-radius: 8px">
              <div style="font-size: 20px; font-weight: 700; color: #DC2626">{{ diffSummary.missingInCode }}</div>
              <div style="font-size: 11px; color: #71717A; margin-top: 2px">No code</div>
            </div>
            <div style="text-align: center; padding: 10px; background: #EFF6FF; border-radius: 8px">
              <div style="font-size: 20px; font-weight: 700; color: #2563EB">{{ diffSummary.missingInFigma }}</div>
              <div style="font-size: 11px; color: #71717A; margin-top: 2px">No Figma</div>
            </div>
          </div>

          <!-- Health score bar -->
          <div v-if="diffSummary" style="margin-bottom: 16px; padding: 12px 16px; background: #F4F4F5; border-radius: 10px; display: flex; align-items: center; justify-content: space-between">
            <span style="font-size: 13px; font-weight: 500; color: #52525B">Health Score</span>
            <span style="font-size: 20px; font-weight: 700" :style="{ color: diffSummary.healthScore >= 80 ? '#16A34A' : diffSummary.healthScore >= 50 ? '#D97706' : '#DC2626' }">
              {{ diffSummary.healthScore }}%
            </span>
          </div>

          <button class="btn-primary" :disabled="diffComputing" @click="handleComputeDiff">
            <GitCompareArrows :size="13" :stroke-width="2.2" :class="{ 'animate-spin-slow': diffComputing }" />
            {{ diffComputing ? 'Computing...' : diffSummary ? 'Re-compute Diff' : 'Run Diff' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, RefreshCw, Link2, Github, GitCompareArrows, Settings2, Code2, RotateCcw } from 'lucide-vue-next'
import type { DiffSummaryData } from '~/types'

// === Figma ===
const { connection, syncing, loading, error, fetchStatus, connect, sync, disconnect } = useFigmaConnection()
const pat = ref('')
const fileUrl = ref('')
const syncResult = ref<{ tokenCount: number; componentCount: number; categories: Record<string, number> } | null>(null)

// === GitHub ===
const {
  connection: ghConnection,
  syncing: ghSyncing,
  loading: ghLoading,
  error: ghError,
  fetchStatus: ghFetchStatus,
  connect: ghConnect,
  sync: ghSync,
  disconnect: ghDisconnect,
} = useGitHubConnection()
const ghPat = ref('')
const ghRepoUrl = ref('')
const ghSyncResult = ref<{ tokenCount: number; categories: Record<string, number> } | null>(null)

// === Diff ===
const { summary: diffSummary, computing: diffComputing, computeDiff, fetchResults: fetchDiffResults } = useTokenDiff()

// === Preferences ===
const { sourceOfTruth, fetchPreferences, updatePreferences, loading: prefLoading } = usePreferences()
const prefSaved = ref(false)

// Fetch statuses on mount
onMounted(async () => {
  await Promise.all([fetchStatus(), ghFetchStatus(), fetchPreferences()])
  if (connection.value.connected && ghConnection.value.connected) {
    fetchDiffResults()
  }
})

/** Extract file key from Figma URL */
function extractFileKey(url: string): string | null {
  const match = url.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

// Figma handlers
async function handleConnect() {
  const fileKey = extractFileKey(fileUrl.value) || fileUrl.value.trim()
  if (!fileKey) return
  try {
    await connect(pat.value.trim(), fileKey)
    syncResult.value = await sync()
  } catch {
    // Error is handled by composable
  }
}

async function handleSync() {
  syncResult.value = null
  try {
    syncResult.value = await sync()
  } catch {
    // Error is handled by composable
  }
}

async function handleDisconnect() {
  await disconnect()
  syncResult.value = null
  pat.value = ''
  fileUrl.value = ''
}

// GitHub handlers
async function handleGhConnect() {
  try {
    await ghConnect(ghPat.value.trim(), ghRepoUrl.value.trim())
    ghSyncResult.value = await ghSync()
  } catch {
    // Error is handled by composable
  }
}

async function handleGhSync() {
  ghSyncResult.value = null
  try {
    ghSyncResult.value = await ghSync()
  } catch {
    // Error is handled by composable
  }
}

async function handleGhDisconnect() {
  await ghDisconnect()
  ghSyncResult.value = null
  ghPat.value = ''
  ghRepoUrl.value = ''
  diffSummary.value = null
}

// Diff handler
async function handleComputeDiff() {
  try {
    await computeDiff()
  } catch {
    // Error is handled by composable
  }
}

// Preferences handlers
async function handleSourceChange(value: 'figma' | 'code') {
  if (value === sourceOfTruth.value) return
  prefSaved.value = false
  try {
    await updatePreferences({ sourceOfTruth: value })
    prefSaved.value = true
    setTimeout(() => { prefSaved.value = false }, 4000)
  } catch {
    // Error handled by composable
  }
}

async function handleResetOnboarding() {
  try {
    await updatePreferences({ onboardingCompleted: false })
    navigateTo('/onboarding')
  } catch {
    // Error handled by composable
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d ago`
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  font-size: 13px;
  color: #09090B;
  outline: none;
  background: #FFFFFF;
  transition: border-color 120ms ease;
  box-sizing: border-box;
  font-family: inherit;
}
.input-field:focus {
  border-color: #2C2C2E;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #1a1a1a;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease;
  font-family: inherit;
}
.btn-primary:hover:not(:disabled) {
  background: #333;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: transparent;
  color: #71717A;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 120ms ease;
  font-family: inherit;
}
.btn-ghost:hover {
  color: #DC2626;
  border-color: #FECACA;
  background: #FEF2F2;
}
.animate-spin-slow {
  animation: spin 1.2s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.sot-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: #FFFFFF;
  color: #71717A;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 120ms ease;
  font-family: inherit;
}
.sot-btn:first-child {
  border-right: 1px solid #E4E4E7;
}
.sot-btn:hover:not(:disabled):not(.sot-active) {
  background: #F4F4F5;
}
.sot-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sot-active {
  background: #09090B !important;
  color: #FFFFFF;
}
.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: none;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #71717A;
  cursor: pointer;
  font-family: inherit;
  transition: all 120ms ease;
  white-space: nowrap;
}
.btn-text:hover {
  color: #09090B;
  border-color: #A1A1AA;
}
</style>
