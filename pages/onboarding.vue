<template>
  <div style="display: flex; height: 100vh; overflow: hidden; background: #FFFFFF">
    <!-- LEFT PANEL -->
    <div
      style="
        width: 50%;
        display: flex;
        flex-direction: column;
        padding: 40px 48px;
        position: relative;
        overflow-y: auto;
      "
    >
      <!-- Logo -->
      <div style="margin-bottom: 48px">
        <Logo />
      </div>

      <!-- Progress bar (3 steps) -->
      <div style="display: flex; gap: 6px; margin-bottom: 48px">
        <div
          v-for="i in 3"
          :key="i"
          style="flex: 1; height: 3px; border-radius: 2px; transition: background 0.3s ease"
          :style="{
            background: i - 1 <= step ? '#2C2C2E' : '#E4E4E7',
          }"
        />
      </div>

      <!-- Step content -->
      <div style="display: flex; flex-direction: column; max-width: 400px">
        <!-- Step 0: Connect Figma -->
        <template v-if="step === 0">
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0 0 8px 0; line-height: 1.2">
            Connect Figma
          </h1>
          <p style="font-size: 15px; color: #71717A; margin: 0 0 32px 0; line-height: 1.5">
            Link your design library to start tracking health.
          </p>

          <!-- Connected banner -->
          <div
            v-if="figmaConnected"
            style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; margin-bottom: 12px"
          >
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #16A34A; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
              <Check :size="12" color="#FFFFFF" :stroke-width="3" />
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 600; color: #09090B">Connected</div>
              <div style="font-size: 12px; color: #71717A; margin-top: 1px">
                {{ figmaFileName }} &middot; {{ figmaTokenCount }} tokens
              </div>
            </div>
          </div>

          <!-- Connect form -->
          <div v-if="!figmaConnected" style="display: flex; flex-direction: column; gap: 14px">
            <!-- PAT Input -->
            <div>
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">
                Personal Access Token
              </label>
              <input
                v-model="figmaPat"
                type="password"
                placeholder="figd_xxxxxxxxxx"
                style="width: 100%; padding: 10px 14px; border: 1.5px solid #E4E4E7; border-radius: 10px; font-size: 13px; color: #09090B; outline: none; background: #FFFFFF; transition: border-color 0.15s ease; box-sizing: border-box; font-family: inherit"
                @focus="(e: FocusEvent) => { (e.target as HTMLElement).style.borderColor = '#D4D4D8' }"
                @blur="(e: FocusEvent) => { (e.target as HTMLElement).style.borderColor = '#E4E4E7' }"
              />
              <a
                href="https://www.figma.com/developers/api#access-tokens"
                target="_blank"
                style="font-size: 11px; color: #71717A; margin-top: 4px; display: inline-block; text-decoration: underline"
              >
                How to get a token →
              </a>
            </div>

            <!-- File URL Input -->
            <div>
              <label style="font-size: 12px; font-weight: 600; color: #09090B; display: block; margin-bottom: 6px">
                Figma file URL
              </label>
              <input
                v-model="figmaFileUrl"
                type="text"
                placeholder="https://figma.com/design/abc123/..."
                style="width: 100%; padding: 10px 14px; border: 1.5px solid #E4E4E7; border-radius: 10px; font-size: 13px; color: #09090B; outline: none; background: #FFFFFF; transition: border-color 0.15s ease; box-sizing: border-box; font-family: inherit"
                @focus="(e: FocusEvent) => { (e.target as HTMLElement).style.borderColor = '#D4D4D8' }"
                @blur="(e: FocusEvent) => { (e.target as HTMLElement).style.borderColor = '#E4E4E7' }"
              />
            </div>

            <!-- Error message -->
            <div v-if="figmaError" style="padding: 10px 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; font-size: 12px; color: #DC2626">
              {{ figmaError }}
            </div>

            <!-- Connect button -->
            <button
              :disabled="!figmaPat || !figmaFileUrl || figmaLoading"
              style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 24px; background: #2C2C2E; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; color: #FFFFFF; cursor: pointer; transition: all 0.15s ease; font-family: inherit"
              :style="{
                opacity: (!figmaPat || !figmaFileUrl || figmaLoading) ? 0.5 : 1,
                cursor: (!figmaPat || !figmaFileUrl || figmaLoading) ? 'not-allowed' : 'pointer',
              }"
              @click="connectFigma"
            >
              <svg v-if="!figmaLoading" width="18" height="18" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
                <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
                <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
                <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
                <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
              </svg>
              {{ figmaLoading ? 'Connecting...' : 'Connect Figma' }}
            </button>
          </div>
        </template>

        <!-- Step 1: Connect Git -->
        <template v-if="step === 1">
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0 0 8px 0; line-height: 1.2">
            Connect Git
          </h1>
          <p style="font-size: 15px; color: #71717A; margin: 0 0 32px 0; line-height: 1.5">
            Link your repository for token and component comparison.
          </p>

          <!-- Connected banner -->
          <div
            v-if="gitConnected"
            style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; margin-bottom: 12px"
          >
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #16A34A; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
              <Check :size="12" color="#FFFFFF" :stroke-width="3" />
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 600; color: #09090B">Connected</div>
              <div style="font-size: 12px; color: #71717A; margin-top: 1px">
                riot/design-tokens &middot; src/tokens/ &middot; src/components/
              </div>
            </div>
          </div>

          <!-- Connect button -->
          <button
            v-if="!gitConnected"
            style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 24px; background: #FFFFFF; border: 1.5px solid #E4E4E7; border-radius: 12px; font-size: 14px; font-weight: 600; color: #09090B; cursor: pointer; transition: all 0.15s ease"
            @click="connectGit"
            @mouseenter="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.borderColor = '#D4D4D8'; (e.currentTarget as HTMLElement).style.background = '#FAFAFA' }"
            @mouseleave="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.borderColor = '#E4E4E7'; (e.currentTarget as HTMLElement).style.background = '#FFFFFF' }"
          >
            <GitBranch :size="18" color="#09090B" />
            Connect GitHub
          </button>
        </template>

        <!-- Step 2: Source of Truth + First Scan -->
        <template v-if="step === 2">
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #09090B; margin: 0 0 8px 0; line-height: 1.2">
            Source of truth
          </h1>
          <p style="font-size: 15px; color: #71717A; margin: 0 0 32px 0; line-height: 1.5">
            Both are connected. Which side drives your design system?
          </p>

          <!-- Toggle switch -->
          <div
            v-if="!scanning"
            style="display: flex; background: #F4F4F5; border-radius: 10px; padding: 4px; margin-bottom: 20px"
          >
            <button
              style="flex: 1; padding: 10px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease"
              :style="{
                background: sourceOfTruth === 'figma' ? '#FFFFFF' : 'transparent',
                color: sourceOfTruth === 'figma' ? '#09090B' : '#71717A',
                boxShadow: sourceOfTruth === 'figma' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }"
              @click="sourceOfTruth = 'figma'"
            >
              <svg width="16" height="16" viewBox="0 0 38 57" fill="none" style="flex-shrink: 0">
                <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
                <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
                <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
                <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
                <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
              </svg>
              Figma
            </button>
            <button
              style="flex: 1; padding: 10px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease"
              :style="{
                background: sourceOfTruth === 'code' ? '#FFFFFF' : 'transparent',
                color: sourceOfTruth === 'code' ? '#09090B' : '#71717A',
                boxShadow: sourceOfTruth === 'code' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }"
              @click="sourceOfTruth = 'code'"
            >
              <Code2 :size="16" />
              Code
            </button>
          </div>

          <!-- Description -->
          <div
            v-if="!scanning"
            style="padding: 14px 16px; background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 10px; font-size: 13px; color: #71717A; line-height: 1.6; margin-bottom: 24px"
          >
            <template v-if="sourceOfTruth === 'figma'">
              <span style="font-weight: 600; color: #09090B">Figma leads.</span>
              Token values in your Figma library are the canonical source. Code tokens that differ will be flagged as drifted.
            </template>
            <template v-else>
              <span style="font-weight: 600; color: #09090B">Code leads.</span>
              Token values in your repository are the canonical source. Figma variables that differ will be flagged as drifted.
            </template>
          </div>

          <!-- Scanning progress (replaces toggle + description when scanning) -->
          <div
            v-if="scanning"
            style="display: flex; flex-direction: column; align-items: center; padding: 24px 0"
          >
            <div
              style="width: 48px; height: 48px; border-radius: 50%; border: 3px solid #E4E4E7; border-top-color: #2C2C2E; margin-bottom: 16px"
              class="animate-spin-slow"
            />
            <div style="font-size: 14px; font-weight: 600; color: #09090B">
              Scanning tokens...
            </div>
            <div style="font-size: 13px; color: #A1A1AA; margin-top: 4px">
              Comparing 142 variables against code
            </div>
            <div style="width: 100%; height: 4px; background: #E4E4E7; border-radius: 2px; margin-top: 24px; overflow: hidden">
              <div
                style="height: 100%; background: #2C2C2E; border-radius: 2px; transition: width 0.3s ease"
                :style="{ width: scanProgress + '%' }"
              />
            </div>
          </div>

          <!-- Run first scan button -->
          <button
            v-if="!scanning"
            style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 24px; background: #2C2C2E; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; color: #FFFFFF; cursor: pointer; transition: all 0.15s ease"
            @click="startScan"
            @mouseenter="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '#1C1C1E' }"
            @mouseleave="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '#2C2C2E' }"
          >
            <Zap :size="16" />
            Run first scan
          </button>
        </template>

        <!-- Bottom navigation -->
        <div
          v-if="!scanning"
          style="display: flex; align-items: center; justify-content: space-between; padding-top: 32px; border-top: 1px solid #F4F4F5; margin-top: 48px"
        >
          <!-- Back button -->
          <button
            v-if="step > 0"
            style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: transparent; border: none; font-size: 13px; font-weight: 500; color: #71717A; cursor: pointer; border-radius: 8px; transition: color 0.15s ease"
            @click="step--"
            @mouseenter="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.color = '#09090B' }"
            @mouseleave="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.color = '#71717A' }"
          >
            <ChevronLeft :size="16" />
            Back
          </button>
          <div v-else />

          <!-- Step counter -->
          <span style="font-size: 13px; color: #A1A1AA">
            Step {{ step + 1 }} of 3
          </span>

          <!-- Continue button (only steps 0 and 1) -->
          <button
            v-if="step < 2"
            :disabled="!canContinue"
            style="display: flex; align-items: center; gap: 6px; padding: 10px 20px; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s ease"
            :style="{
              background: canContinue ? '#2C2C2E' : '#E4E4E7',
              color: canContinue ? '#FFFFFF' : '#A1A1AA',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              opacity: canContinue ? 1 : 0.6,
            }"
            @click="canContinue && step++"
          >
            Continue
            <ChevronRight :size="14" />
          </button>
          <div v-else />
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL (dark preview) -->
    <div
      style="width: 50%; background: #0C0C0E; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 48px; overflow: hidden"
    >
      <!-- Background subtle grid pattern -->
      <div
        style="position: absolute; inset: 0; opacity: 0.03; background-image: radial-gradient(circle, #FFFFFF 1px, transparent 1px); background-size: 24px 24px"
      />

      <!-- Preview content -->
      <div
        style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; width: 100%; max-width: 360px"
      >
        <!-- Step 0 Preview: Not connected -->
        <template v-if="step === 0 && !figmaConnected">
          <div style="width: 64px; height: 64px; border-radius: 16px; background: #161618; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 20px">
            <Layers :size="28" color="#71717A" />
          </div>
          <p style="font-size: 15px; color: #71717A; text-align: center">
            Connect your Figma library
          </p>
        </template>

        <!-- Step 0 Preview: Connected -->
        <template v-if="step === 0 && figmaConnected">
          <div style="width: 100%; background: #161618; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #A259FF, #1ABCFE); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
                <Layers :size="20" color="#FFFFFF" />
              </div>
              <div>
                <div style="font-size: 15px; font-weight: 650; color: #F4F4F5; letter-spacing: -0.3px">
                  {{ figmaFileName || 'Design System' }}
                </div>
                <div style="font-size: 12px; color: #71717A; margin-top: 2px">
                  Connected just now
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 12px">
              <div
                v-for="stat in previewFigmaStats"
                :key="stat.label"
                style="flex: 1; padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; text-align: center"
              >
                <div class="font-display" style="font-size: 22px; font-weight: 700; color: #F4F4F5">
                  {{ stat.value }}
                </div>
                <div style="font-size: 11px; color: #71717A; margin-top: 4px">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Step 1 Preview: Not connected -->
        <template v-if="step === 1 && !gitConnected">
          <div style="width: 64px; height: 64px; border-radius: 16px; background: #161618; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 20px">
            <GitBranch :size="28" color="#71717A" />
          </div>
          <p style="font-size: 15px; color: #71717A; text-align: center">
            Connect your repository
          </p>
        </template>

        <!-- Step 1 Preview: Connected -->
        <template v-if="step === 1 && gitConnected">
          <div style="width: 100%; background: #161618; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px">
              <GitBranch :size="16" color="#A1A1AA" />
              <span style="font-size: 14px; font-weight: 600; color: #F4F4F5">
                riot/design-tokens
              </span>
              <span style="font-size: 11px; color: #71717A; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 6px; margin-left: auto">
                main
              </span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px">
              <div
                v-for="file in previewGitFiles"
                :key="file.name"
                style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 8px"
              >
                <FileCode :size="14" color="#71717A" />
                <span style="color: #A1A1AA; flex: 1; font-family: 'SF Mono', 'JetBrains Mono', monospace; font-size: 12px">
                  {{ file.name }}
                </span>
                <Check :size="14" color="#16A34A" />
              </div>
            </div>
          </div>
        </template>

        <!-- Step 2 Preview: Source of truth (not scanning) -->
        <template v-if="step === 2 && !scanning">
          <div style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 32px">
            <!-- Figma side -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px">
              <div
                style="width: 72px; height: 72px; border-radius: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease"
                :style="{
                  background: sourceOfTruth === 'figma' ? 'rgba(162,89,255,0.12)' : '#161618',
                  border: sourceOfTruth === 'figma' ? '2px solid rgba(162,89,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }"
              >
                <svg width="28" height="28" viewBox="0 0 38 57" fill="none">
                  <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
                  <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
                  <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
                  <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
                  <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
                </svg>
              </div>
              <span style="font-size: 13px; font-weight: 600; transition: color 0.3s ease" :style="{ color: sourceOfTruth === 'figma' ? '#F4F4F5' : '#71717A' }">
                Figma
              </span>
              <span
                v-if="sourceOfTruth === 'figma'"
                style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #A259FF; background: rgba(162,89,255,0.1); padding: 3px 10px; border-radius: 6px"
              >
                Source
              </span>
            </div>

            <!-- Arrow -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
              <ChevronRight v-if="sourceOfTruth === 'figma'" :size="24" color="#A1A1AA" />
              <ChevronLeft v-else :size="24" color="#A1A1AA" />
              <span style="font-size: 11px; color: #52525B">drives</span>
            </div>

            <!-- Code side -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px">
              <div
                style="width: 72px; height: 72px; border-radius: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease"
                :style="{
                  background: sourceOfTruth === 'code' ? 'rgba(129,140,248,0.12)' : '#161618',
                  border: sourceOfTruth === 'code' ? '2px solid rgba(129,140,248,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }"
              >
                <Code2 :size="28" :color="sourceOfTruth === 'code' ? '#818CF8' : '#71717A'" />
              </div>
              <span style="font-size: 13px; font-weight: 600; transition: color 0.3s ease" :style="{ color: sourceOfTruth === 'code' ? '#F4F4F5' : '#71717A' }">
                Code
              </span>
              <span
                v-if="sourceOfTruth === 'code'"
                style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #818CF8; background: rgba(129,140,248,0.1); padding: 3px 10px; border-radius: 6px"
              >
                Source
              </span>
            </div>
          </div>
        </template>

        <!-- Step 2 Preview: Scanning -->
        <template v-if="step === 2 && scanning">
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%">
            <div style="position: relative; width: 160px; height: 160px; margin-bottom: 24px">
              <svg width="160" height="160" viewBox="0 0 160 160" style="transform: rotate(-90deg)">
                <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" />
                <circle
                  cx="80" cy="80" r="68" fill="none" stroke="#2C2C2E" stroke-width="8" stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 68"
                  :stroke-dashoffset="2 * Math.PI * 68 * (1 - displayScore / 100)"
                  style="transition: stroke-dashoffset 0.3s ease"
                />
              </svg>
              <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center">
                <span class="font-display tabular-nums" style="font-size: 44px; font-weight: 700; color: #F4F4F5; line-height: 1">
                  {{ displayScore }}
                </span>
                <span style="font-size: 12px; color: #71717A; margin-top: 4px">Health Score</span>
              </div>
            </div>
            <div style="width: 100%; background: #161618; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px 20px">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px">
                <span style="font-size: 12px; color: #71717A">Scanning tokens...</span>
                <span class="font-display tabular-nums" style="font-size: 12px; color: #A1A1AA">{{ scanProgress }}%</span>
              </div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden">
                <div
                  style="height: 100%; background: #2C2C2E; border-radius: 2px; transition: width 0.3s ease"
                  :style="{ width: scanProgress + '%' }"
                />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Bottom helper text -->
      <div style="position: absolute; bottom: 32px; left: 48px; right: 48px; text-align: center">
        <p style="font-size: 12px; color: #52525B; line-height: 1.6">
          {{ helperText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  GitBranch,
  Layers,
  Zap,
  FileCode,
  Code2,
} from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

// ── Preferences ──────────────────────────────────────
const { sourceOfTruth: savedSourceOfTruth, fetchPreferences, updatePreferences } = usePreferences()

// ── Figma real connection ──────────────────────────────
const { connection: figmaConnection, connect: figmaConnect, loading: figmaLoadingState, error: figmaErrorState } = useFigmaConnection()
const figmaPat = ref('')
const figmaFileUrl = ref('')
const figmaLoading = ref(false)
const figmaError = ref<string | null>(null)
const figmaFileName = ref('')
const figmaTokenCount = ref(0)

// ── State ──────────────────────────────────────────────
const step = ref(0)
const figmaConnected = ref(false)
const gitConnected = ref(false)
const sourceOfTruth = ref<'figma' | 'code'>('figma')
const scanning = ref(false)
const scanProgress = ref(0)
const displayScore = ref(0)

let scanInterval: ReturnType<typeof setInterval> | null = null

// Load existing preferences (if user is re-running onboarding)
onMounted(async () => {
  try {
    await fetchPreferences()
    sourceOfTruth.value = savedSourceOfTruth.value
  } catch {
    // Default to figma if no preferences exist
  }
})

// ── Computed ───────────────────────────────────────────
const canContinue = computed(() => {
  if (step.value === 0) return figmaConnected.value
  if (step.value === 1) return gitConnected.value
  return false
})

const helperText = computed(() => {
  switch (step.value) {
    case 0:
      return 'We only request read access to your Figma files. Your designs are never modified.'
    case 1:
      return 'We scan your token files for JSON, YAML, CSS custom properties, and W3C DTCG format.'
    case 2:
      return scanning.value
        ? 'Comparing variables, styles, and components across both sources...'
        : 'You can change the source of truth later in your workspace settings.'
    default:
      return ''
  }
})

const previewFigmaStats = computed(() => [
  { value: figmaTokenCount.value > 0 ? String(figmaTokenCount.value) : '—', label: 'Tokens' },
  { value: figmaFileName.value ? '1' : '—', label: 'File' },
  { value: '✓', label: 'Connected' },
])

const previewGitFiles = [
  { name: 'src/tokens/colors.json' },
  { name: 'src/tokens/spacing.json' },
  { name: 'src/tokens/typography.json' },
  { name: 'src/tokens/shadows.json' },
  { name: 'src/components/Button.tsx' },
  { name: 'src/components/Input.tsx' },
]

// ── Actions ────────────────────────────────────────────
async function connectFigma() {
  if (!figmaPat.value || !figmaFileUrl.value) return

  // Extract file key from URL
  const match = figmaFileUrl.value.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)/)
  const fileKey = match ? match[1] : figmaFileUrl.value.trim()

  figmaLoading.value = true
  figmaError.value = null

  try {
    const result = await figmaConnect(figmaPat.value.trim(), fileKey)
    figmaConnected.value = true
    figmaFileName.value = result.fileName
    figmaTokenCount.value = 0 // Will be populated after sync
  } catch (e: any) {
    figmaError.value = e?.data?.message || 'Failed to connect to Figma. Check your token and file URL.'
  } finally {
    figmaLoading.value = false
  }
}

function connectGit() {
  gitConnected.value = true
}

async function startScan() {
  scanning.value = true
  scanProgress.value = 0
  displayScore.value = 0

  // Save preferences before scan animation
  try {
    await updatePreferences({
      sourceOfTruth: sourceOfTruth.value,
      onboardingCompleted: true,
    })
  } catch {
    // Continue with scan even if preference save fails
  }

  const targetScore = 73
  const totalDuration = 3000
  const intervalMs = 50
  const totalSteps = totalDuration / intervalMs
  let currentStep = 0

  scanInterval = setInterval(() => {
    currentStep++
    const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100))
    scanProgress.value = progress

    const progressRatio = currentStep / totalSteps
    const easedRatio = 1 - Math.pow(1 - progressRatio, 3)
    displayScore.value = Math.min(targetScore, Math.round(easedRatio * targetScore))

    if (currentStep >= totalSteps) {
      if (scanInterval) clearInterval(scanInterval)
      scanProgress.value = 100
      displayScore.value = targetScore

      setTimeout(() => {
        navigateTo('/dashboard')
      }, 800)
    }
  }, intervalMs)
}

// ── Cleanup ────────────────────────────────────────────
onUnmounted(() => {
  if (scanInterval) clearInterval(scanInterval)
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin 1s linear infinite;
}
</style>
