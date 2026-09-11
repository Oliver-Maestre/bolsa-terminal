package com.bolsaterminal.core.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface PortfolioDao {
    @Query("SELECT * FROM portfolio_positions ORDER BY addedAt DESC")
    fun observeAll(): Flow<List<PortfolioPositionEntity>>

    @Query("SELECT * FROM portfolio_positions WHERE id = :id")
    suspend fun getById(id: String): PortfolioPositionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: PortfolioPositionEntity)

    @Update
    suspend fun update(entity: PortfolioPositionEntity)

    @Query("DELETE FROM portfolio_positions WHERE id = :id")
    suspend fun deleteById(id: String)
}
