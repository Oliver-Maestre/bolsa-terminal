package com.bolsaterminal.core.data.local

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideBolsaDatabase(@ApplicationContext context: Context): BolsaDatabase =
        Room.databaseBuilder(context, BolsaDatabase::class.java, "bolsa-terminal.db").build()

    @Provides
    @Singleton
    fun providePortfolioDao(database: BolsaDatabase): PortfolioDao = database.portfolioDao()
}
