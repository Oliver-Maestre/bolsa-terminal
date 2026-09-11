package com.bolsaterminal.core.data

import com.bolsaterminal.core.network.AppSettingsProvider
import com.bolsaterminal.domain.repository.AiRepository
import com.bolsaterminal.domain.repository.BotRepository
import com.bolsaterminal.domain.repository.BrokerRepository
import com.bolsaterminal.domain.repository.MarketRepository
import com.bolsaterminal.domain.repository.PortfolioRepository
import com.bolsaterminal.domain.repository.SimulatorRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {

    @Binds
    @Singleton
    abstract fun bindAppSettingsProvider(impl: AppSettingsProviderImpl): AppSettingsProvider

    @Binds
    @Singleton
    abstract fun bindMarketRepository(impl: MarketRepositoryImpl): MarketRepository

    @Binds
    @Singleton
    abstract fun bindPortfolioRepository(impl: PortfolioRepositoryImpl): PortfolioRepository

    @Binds
    @Singleton
    abstract fun bindBrokerRepository(impl: BrokerRepositoryImpl): BrokerRepository

    @Binds
    @Singleton
    abstract fun bindBotRepository(impl: BotRepositoryImpl): BotRepository

    @Binds
    @Singleton
    abstract fun bindAiRepository(impl: AiRepositoryImpl): AiRepository

    @Binds
    @Singleton
    abstract fun bindSimulatorRepository(impl: SimulatorRepositoryImpl): SimulatorRepository
}
