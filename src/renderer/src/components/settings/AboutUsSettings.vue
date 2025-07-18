<template>
  <div class="w-full h-full">
    <div class="w-full h-full flex flex-col gap-2">
      <div class="w-full h-full flex flex-col items-center justify-center gap-2">
        <img src="@/assets/logo.png" class="w-10 h-10" />
        <div class="flex flex-col gap-2 items-center" :dir="languageStore.dir">
          <h1 class="text-2xl font-bold">{{ t('about.title') }}</h1>
          <p class="text-xs text-muted-foreground pb-4">v{{ appVersion }}</p>
          <p class="text-sm text-muted-foreground px-8">
            {{ t('about.description') }}
          </p>
          <div class="flex gap-2">
            <a
              class="text-xs text-muted-foreground hover:text-primary flex items-center"
              href="https://deepchat.thinkinai.xyz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="lucide:globe" class="mr-1 h-3 w-3" />
              {{ t('about.website') }}</a
            >
            <a
              class="text-xs text-muted-foreground hover:text-primary flex items-center"
              href="https://github.com/ThinkInAIXYZ/deepchat"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="lucide:github" class="mr-1 h-3 w-3" />
              GitHub
            </a>
            <a
              class="text-xs text-muted-foreground hover:text-primary flex items-center"
              href="https://github.com/ThinkInAIXYZ/deepchat/blob/dev/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="lucide:scale" class="mr-1 h-3 w-3" />
              Apache License 2.0
            </a>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="flex gap-2 mt-2">
          <!-- 免责声明按钮 -->
          <Button variant="outline" size="sm" class="mb-2 text-xs" @click="openDisclaimerDialog">
            <Icon icon="lucide:info" class="mr-1 h-3 w-3" />
            {{ t('about.disclaimerButton') }}
          </Button>

          <!-- 检查更新按钮 -->
          <Button
            variant="outline"
            size="sm"
            class="mb-2 text-xs"
            :disabled="upgrade.isChecking || upgrade.isDownloading || upgrade.isRestarting"
            @click="handleCheckUpdate"
          >
            <Icon
              icon="lucide:refresh-cw"
              class="mr-1 h-3 w-3"
              :class="{
                'animate-spin': upgrade.isChecking || upgrade.isDownloading
              }"
            />
            <span v-if="upgrade.isDownloading">
              <template v-if="upgrade.updateProgress">
                {{ t('update.downloading') }}: {{ Math.round(upgrade.updateProgress.percent) }}%
              </template>
              <template v-else> {{ t('update.downloading') }}</template>
            </span>
            <span v-else-if="upgrade.isReadyToInstall">
              {{ t('update.installNow') }}
            </span>
            <span v-else>
              {{ t('about.checkUpdateButton') }}
            </span>
          </Button>
        </div>

        <!-- <div class="text-sm text-muted-foreground p-6 rounded-lg shadow-md bg-card border">
          <h2 class="text-lg font-semibold mb-4 flex items-center">
            <Icon icon="lucide:cpu" class="mr-2 h-5 w-5" />
            {{ t('about.deviceInfo.title') }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center space-x-2">
              <Icon icon="lucide:monitor" class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium">{{ t('about.deviceInfo.platform') }}:</span>
              <span>{{ deviceInfo.platform }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon icon="lucide:layers" class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium">{{ t('about.deviceInfo.arch') }}:</span>
              <span>{{ deviceInfo.arch }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon icon="lucide:cpu" class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium">{{ t('about.deviceInfo.cpuModel') }}:</span>
              <span class="truncate">{{ deviceInfo.cpuModel }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon icon="lucide:database" class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium">{{ t('about.deviceInfo.totalMemory') }}:</span>
              <span>{{ (deviceInfo.totalMemory / (1024 * 1024 * 1024)).toFixed(0) }} GB</span>
            </div>
            <div class="flex items-center space-x-2 col-span-full">
              <Icon icon="lucide:info" class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium"
                >{{ t('about.deviceInfo.osVersion') || 'OS Version' }}:</span
              >
              <span>{{ deviceInfo.osVersion }}</span>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>

  <!-- 免责声明对话框 -->
  <Dialog :open="isDisclaimerOpen" @update:open="isDisclaimerOpen = $event">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('about.disclaimerTitle') }}</DialogTitle>
        <DialogDescription>
          <div class="max-h-[300px] overflow-y-auto" v-html="disclaimerContent"></div>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button @click="isDisclaimerOpen = false">{{ t('common.close') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { usePresenter } from '@/composables/usePresenter'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { renderMarkdown, getCommonMarkdown } from 'vue-renderer-markdown'
import { useUpgradeStore } from '@/stores/upgrade'
import { useLanguageStore } from '@/stores/language'

const { t } = useI18n()
const languageStore = useLanguageStore()
const devicePresenter = usePresenter('devicePresenter')
const deviceInfo = ref<{
  platform: string
  arch: string
  cpuModel: string
  totalMemory: number
  osVersion: string
}>({
  platform: '',
  arch: '',
  cpuModel: '',
  totalMemory: 0,
  osVersion: ''
})
const appVersion = ref('')
const upgrade = useUpgradeStore()

// 免责声明对话框状态
const isDisclaimerOpen = ref(false)

// 打开免责声明对话框
const openDisclaimerDialog = () => {
  isDisclaimerOpen.value = true
}

// 检查更新
const handleCheckUpdate = async () => {
  // 如果已下载完成，直接打开更新对话框
  if (upgrade.isReadyToInstall) {
    upgrade.openUpdateDialog()
    return
  }

  // 正常检查更新流程
  await upgrade.checkUpdate()

  // 不再自动打开对话框，而是由下载完成后自动弹出
}

const md = getCommonMarkdown()
const disclaimerContent = computed(() => renderMarkdown(md, t('searchDisclaimer')))

onMounted(async () => {
  deviceInfo.value = await devicePresenter.getDeviceInfo()
  appVersion.value = await devicePresenter.getAppVersion()
  console.log(deviceInfo.value)
})
</script>
