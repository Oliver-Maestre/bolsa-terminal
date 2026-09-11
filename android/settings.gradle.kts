pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "BolsaTerminal"

include(":app")
include(":domain")
include(":core:designsystem")
include(":core:network")
include(":core:model")
include(":core:data")
include(":core:common")
include(":features:dashboard")
include(":features:screener")
include(":features:chart")
include(":features:comparison")
include(":features:portfolio")
include(":features:broker")
include(":features:bot")
include(":features:ai")
include(":features:simulator")
