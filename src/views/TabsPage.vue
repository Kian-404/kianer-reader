<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <Icon icon="solar:library-linear" width="24" height="24" />
          <ion-label>书架</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="insights" href="/tabs/insights">
          <Icon icon="solar:chart-square-linear" width="24" height="24" />
          <ion-label>洞察</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <Icon icon="solar:user-linear" width="24" height="24" />
          <ion-label>我的</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonPage, IonRouterOutlet } from '@ionic/vue';
import { Icon } from '@iconify/vue';
</script>
