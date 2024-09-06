<template>
  <div class="editor-header">
    <div class="left">
      <Popover trigger="click" placement="bottom-start" v-model:value="mainMenuVisible">
        <template #content>
          <FileInput accept=".pptist"  @change="files => {
            importSpecificFile(files)
            mainMenuVisible = false
          }">
            <PopoverMenuItem>导入 pptist 文件</PopoverMenuItem>
          </FileInput>
          <FileInput accept="application/vnd.openxmlformats-officedocument.presentationml.presentation"  @change="files => {
            importPPTXFile(files)
            mainMenuVisible = false
          }">
            <PopoverMenuItem>导入 pptx 文件（测试版）</PopoverMenuItem>
          </FileInput>
          <PopoverMenuItem @click="setDialogForExport('pptx')">导出文件</PopoverMenuItem>
          <PopoverMenuItem @click="resetSlides(); mainMenuVisible = false">重置幻灯片</PopoverMenuItem>
          <PopoverMenuItem @click="goLink('https://github.com/pipipi-pikachu/PPTist/issues')">意见反馈</PopoverMenuItem>
          <PopoverMenuItem @click="goLink('https://github.com/pipipi-pikachu/PPTist/blob/master/doc/Q&A.md')">常见问题</PopoverMenuItem>
          <PopoverMenuItem @click="mainMenuVisible = false; hotkeyDrawerVisible = true">快捷操作</PopoverMenuItem>
        </template>
        <div class="menu-item"><IconHamburgerButton class="icon" /></div>
      </Popover>

      <div class="title">
        <Input 
          class="title-input" 
          ref="titleInputRef"
          v-model:value="titleValue" 
          @blur="handleUpdateTitle()" 
          v-if="editingTitle" 
        ></Input>
        <div 
          class="title-text"
          @click="startEditTitle()"
          :title="title"
          v-else
        >{{ title }}</div>
      </div>
    </div>

    <div class="right">
      <div class="group-menu-item">
        <div class="menu-item" v-tooltip="'幻灯片放映（F5）'" @click="enterScreening()">
          <IconPpt class="icon" />
        </div>
        <Popover trigger="click" center>
          <template #content>
            <PopoverMenuItem @click="enterScreeningFromStart()">从头开始</PopoverMenuItem>
            <PopoverMenuItem @click="enterScreening()">从当前页开始</PopoverMenuItem>
          </template>
          <div class="arrow-btn"><IconDown class="arrow" /></div>
        </Popover>
      </div>
      <div class="menu-item" v-tooltip="'导出'" @click="setDialogForExport('pptx')">
        <IconDownload class="icon" />
      </div>
      <div class="menu-item" v-tooltip="'保存'" v-if="parentObj.designMode == '1'" @click="saveTpl()">
        <IconSaveOne class="icon" />
      </div>
      <div class="menu-item" v-tooltip="'预览'" v-if="parentObj.designMode == '1'" @click="preview()">
        <IconPreviewOpen class="icon" />
      </div>
      
    </div>

    <Drawer
      :width="320"
      v-model:visible="hotkeyDrawerVisible"
      placement="right"
    >
      <HotkeyDoc />
      <template v-slot:title>快捷操作</template>
    </Drawer>

    <FullscreenSpin :loading="exporting" tip="正在导入..." />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref ,reactive} from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import useScreening from '@/hooks/useScreening'
import useImport from '@/hooks/useImport'
import useSlideHandler from '@/hooks/useSlideHandler'
import type { DialogForExportTypes } from '@/types/export'

import HotkeyDoc from './HotkeyDoc.vue'
import FileInput from '@/components/FileInput.vue'
import FullscreenSpin from '@/components/FullscreenSpin.vue'
import Drawer from '@/components/Drawer.vue'
import Input from '@/components/Input.vue'
import Popover from '@/components/Popover.vue'
import PopoverMenuItem from '@/components/PopoverMenuItem.vue'
import { onMounted } from 'vue';

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { title } = storeToRefs(slidesStore)
const { enterScreening, enterScreeningFromStart } = useScreening()
const { importSpecificFile, importPPTXFile, exporting } = useImport()
const { resetSlides } = useSlideHandler()

const mainMenuVisible = ref(false)
const hotkeyDrawerVisible = ref(false)
const editingTitle = ref(false)
const titleInputRef = ref<InstanceType<typeof Input>>()
const titleValue = ref('')
const parentObj = reactive({
  tplId:"",
  token:"",
  designMode:"2",
  searchData:null,
  apiHeaders:null
})

onMounted(() => {
  // 监听message事件
window.addEventListener('message', (event) => {
  // 判断消息来源是否为父窗口的地址
  if (event.source === window.parent) {
    // 处理接收到的消息
    let obj = JSON.parse(event.data)
    parentObj.tplId = obj.tplId;
    parentObj.token = obj.token;
    parentObj.designMode = obj.designMode;
    parentObj.token = obj.token;
    parentObj.searchData = obj.searchData;
    mainStore.apiHeaders = obj.apiHeaders;
    getTplSettings();
  }
})

  
});

const getTplSettings = () => {
  var obj = {
    params:{
      id:parentObj.tplId,
      tplId:parentObj.tplId,
      searchData:parentObj.searchData,
      apiHeaders:parentObj.apiHeaders,
    },
    url:"/api/slideTpl/getTplSettings"
  }
  if(parentObj.designMode != "1"){
    obj.url = "/api/slideTpl/viewSlides"
  }
  var headers = {
    Authorization:parentObj.token,
  };
  slidesStore.dopost(obj,headers).then(response=>{
    if (response.code == "200")
    {
      slidesStore.title = response.responseData.tplName
      slidesStore.theme = JSON.parse(response.responseData.tplTheme)
      slidesStore.slides = JSON.parse(response.responseData.tplSlides)
      slidesStore.viewportRatio = Number(response.responseData.tplRatio)
    }
  });
}
const saveTpl = () => {
  var obj = {
    params:{
      id:parentObj.tplId,
      tplName:slidesStore.title,
      tplTheme:JSON.stringify(slidesStore.theme),
      tplSlides:JSON.stringify(slidesStore.slides),
      tplRatio:slidesStore.viewportRatio+"",
    },
    url:"/api/slideTpl/saveTplSettings"
  }
  var headers = {
    Authorization:parentObj.token,
  };
  slidesStore.dopost(obj,headers).then(response=>{
    if (response.code == "200")
    {
      
    }
  });
}

const preview = () => {
  let url = import.meta.env.VITE_PREVIEW_URL+ "?tplId=" +parentObj.tplId;
  window.open(url, '_blank');
}



const startEditTitle = () => {
  titleValue.value = title.value
  editingTitle.value = true
  nextTick(() => titleInputRef.value?.focus())
}

const handleUpdateTitle = () => {
  slidesStore.setTitle(titleValue.value)
  editingTitle.value = false
}

const goLink = (url: string) => {
  window.open(url)
  mainMenuVisible.value = false
}

const setDialogForExport = (type: DialogForExportTypes) => {
  mainStore.setDialogForExport(type)
  mainMenuVisible.value = false
}
</script>

<style lang="scss" scoped>
.editor-header {
  background-color: #fff;
  user-select: none;
  border-bottom: 1px solid $borderColor;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}
.left, .right {
  display: flex;
  justify-content: center;
  align-items: center;
}
.menu-item {
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  padding: 0 10px;
  border-radius: $borderRadius;
  cursor: pointer;

  .icon {
    font-size: 18px;
    color: #666;
  }

  &:hover {
    background-color: #f1f1f1;
  }
}
.group-menu-item {
  height: 30px;
  display: flex;
  margin: 0 8px;
  padding: 0 2px;
  border-radius: $borderRadius;

  &:hover {
    background-color: #f1f1f1;
  }

  .menu-item {
    padding: 0 3px;
  }
  .arrow-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
.title {
  height: 32px;
  margin-left: 2px;
  font-size: 13px;

  .title-input {
    width: 200px;
    height: 100%;
    padding-left: 0;
    padding-right: 0;
  }
  .title-text {
    min-width: 20px;
    max-width: 400px;
    line-height: 32px;
    padding: 0 6px;
    border-radius: $borderRadius;
    cursor: pointer;

    @include ellipsis-oneline();

    &:hover {
      background-color: #f1f1f1;
    }
  }
}
.github-link {
  display: inline-block;
  height: 30px;
}
</style>