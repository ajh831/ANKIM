package shoppingmall.ankim.domain.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import shoppingmall.ankim.domain.category.entity.Category;
import shoppingmall.ankim.domain.product.entity.Product;
import shoppingmall.ankim.domain.product.repository.query.ProductQueryRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Long>, ProductQueryRepository {
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.optionGroups WHERE p.no = :productId")
    Optional<Product> findByIdWithOptionGroups(@Param("productId") Long productId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.productImgs WHERE p.no = :productId")
    Optional<Product> findByIdWithProductImgs(@Param("productId") Long productId);

    @Modifying
    @Query("UPDATE Product p SET p.category = :newCategory WHERE p.category.no = :oldCategoryId")
    void updateCategoryForProducts(@Param("oldCategoryId") Long oldCategoryId, @Param("newCategory") Category newCategory);

    boolean existsByCategory(Category category);

    @Modifying
    @Query("UPDATE Product p SET p.viewCnt = p.viewCnt + 1 WHERE p.no = :productId")
    void increaseViewCount(@Param("productId") Long productId);
}
