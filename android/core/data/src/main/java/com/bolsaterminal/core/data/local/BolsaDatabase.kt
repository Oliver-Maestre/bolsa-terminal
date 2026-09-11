package com.bolsaterminal.core.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [PortfolioPositionEntity::class], version = 1, exportSchema = false)
abstract class BolsaDatabase : RoomDatabase() {
    abstract fun portfolioDao(): PortfolioDao
}
