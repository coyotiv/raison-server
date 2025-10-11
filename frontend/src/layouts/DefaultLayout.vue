<template>
  <v-app>
    <v-app-bar flat>
      <v-app-bar-title>My App</v-app-bar-title>

      <slot name="appbar-actions" />
    </v-app-bar>

    <v-main>
      <v-container class="py-6">
        <slot />
      </v-container>
    </v-main>

    <v-footer app>
      <span class="text-disabled">© {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>
