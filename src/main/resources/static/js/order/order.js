import { fetchWithAccessToken } from '../utils/fetchUtils.js';

document.addEventListener("DOMContentLoaded", async () => {

    try {
        var data = await fetchWithAccessToken("/api/temp-order", { method: "GET" });

        if (!data || data.error) {
            throw new Error(data.message || "서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }

        if (data.code === 200 && data.data) {
            renderProducts(data.data.items);
        } else {
            showErrorModal(data.message);
        }
    } catch (error) {
        showErrorModal(error.message);
    }


    // 배송지 기존/신규 선택
    var tabs = document.querySelectorAll(".shipping-tab .tab-item");
    var existingAddress = document.querySelector(".existing-address");
    var newAddress = document.querySelector(".new-address");

    // 각 라디오 버튼과 관련 영역 선택
    var incomeRadio = document.querySelector('input[name="receiptType"][value="INCOME"]');
    var spendingRadio = document.querySelector('input[name="receiptType"][value="SPENDING"]');
    var noneRadio = document.querySelector('input[name="receiptType"][value="NONE"]');

    var contactSelect = document.querySelector('.contact-method-select');
    var cashReceiptExtra = document.querySelector('.cash-receipt-extra');
    var cashReceiptSave = document.querySelector('.cash-receipt-save');

    // 현금영수증 번호를 입력하는 input 필드
    var receiptInput = document.querySelector('.cash-receipt-input input');

    // 쿠폰 할인 금액
    var couponToggleBtn = document.querySelector(".coupon-toggle-btn");
    var couponBreakdown = document.querySelector(".coupon-breakdown");

    // 약관 동의 "전체 동의" 체크박스
    var checkAllInput = document.querySelector(".check-all-input");
    // 개별 약관 체크박스들
    var agreementInputs = document.querySelectorAll(".agreement-list input[type='checkbox']");


    // 모달 초기상태 안보이게 설정
    window.closeModal = function () {
        var modal = document.querySelector('.modal');
        var modalOverlay = document.querySelector('.modal-overlay');
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    };

    // 초기 상태: 기존 배송지 보이고 신규입력 숨김
    if (existingAddress && newAddress) {
        existingAddress.style.display = "block";
        newAddress.style.display = "none";
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            // 모든 탭의 active 클래스 제거
            tabs.forEach(t => t.classList.remove("active"));
            // 클릭된 탭에 active 클래스 추가
            tab.classList.add("active");

            // 인덱스 0: 기존 배송지, 1: 신규입력
            if (index === 0) {
                existingAddress.style.display = "block";
                newAddress.style.display = "none";
            } else {
                existingAddress.style.display = "none";
                newAddress.style.display = "block";
            }
        });
    });

    // 라디오 선택에 따른 옵션 업데이트 함수
    function updateReceiptOptions() {
        if (incomeRadio.checked) {
            // 소득공제용 선택 시: 옵션 2개 (휴대폰 번호, 현금영수증 카드번호) / 선택 가능
            contactSelect.disabled = false;
            contactSelect.innerHTML = `
        <option value="PHONE">휴대폰 번호</option>
        <option value="CARDNUM">현금영수증 카드번호</option>
      `;
            // extra와 save 영역 보이기
            cashReceiptExtra.style.display = "";
            cashReceiptSave.style.display = "";
            // 입력 필드 초기화
            receiptInput.value = "";
        } else if (spendingRadio.checked) {
            // 지출증빙용 선택 시: 옵션 1개 (사업자 번호) / 선택 불가능
            contactSelect.disabled = true;
            contactSelect.innerHTML = `<option value="BUSINESS">사업자 번호</option>`;
            cashReceiptExtra.style.display = "";
            cashReceiptSave.style.display = "";
            // 입력 필드 초기화
            receiptInput.value = "";
        } else if (noneRadio.checked) {
            // 미발행 선택 시: extra, save 영역 숨기기
            cashReceiptExtra.style.display = "none";
            cashReceiptSave.style.display = "none";
            // 입력 필드 초기화
            receiptInput.value = "";
        }
    }

    // 모든 라디오 버튼에 change 이벤트 등록
    var receiptRadios = document.querySelectorAll('input[name="receiptType"]');
    receiptRadios.forEach(function(radio) {
        radio.addEventListener("change", updateReceiptOptions);
    });

    // 초기 상태 업데이트
    updateReceiptOptions();


    // 버튼 클릭 -> couponBreakdown 열고/닫기
    couponToggleBtn.addEventListener("click", () => {
        var isOpen = couponToggleBtn.getAttribute("data-open") === "true";
        if (isOpen) {
            couponBreakdown.style.display = "none";
            couponToggleBtn.setAttribute("data-open", "false");
        } else {
            couponBreakdown.style.display = "block";
            couponToggleBtn.setAttribute("data-open", "true");
        }
    });


    // (1) "전체 동의"를 클릭하면 -> 개별 약관 전부 체크/해제
    checkAllInput.addEventListener("change", (e) => {
        var isChecked = e.target.checked;
        agreementInputs.forEach((checkbox) => {
            checkbox.checked = isChecked;
        });
    });

    // (2) 개별 약관 중 하나라도 변경되면
    agreementInputs.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            // 만약 체크 해제된 것이 하나라도 있다면 "전체 동의" 해제
            if (!checkbox.checked) {
                checkAllInput.checked = false;
            } else {
                // 모두 체크되었는지 확인
                var allChecked = Array.from(agreementInputs).every((cb) => cb.checked);
                checkAllInput.checked = allChecked;
            }
        });
    });

    // "약관 보기" 버튼들
    const viewButtons = document.querySelectorAll(".view-btn");

    // [수정] 단일 forEach만 사용하여 클릭 이벤트를 등록
    viewButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // 버튼에 있는 data-fetch-url 속성값 가져오기
            const fetchUrl = btn.getAttribute("data-fetch-url");
            console.log("약관 버튼 클릭 :", fetchUrl);

            if (!fetchUrl) return;

            // HTML 파일 fetch
            fetch(fetchUrl)
                .then(response => response.text())
                .then(html => {
                    // 모달 내부의 .modal-body에 삽입
                    const modalBody = document.querySelector("#termsModal .modal-body");
                    if (modalBody) {
                        modalBody.innerHTML = html;
                    }

                    // 모달 열기
                    document.getElementById("termsModal").style.display = "flex";
                })
                .catch(err => {
                    console.error("약관 파일을 불러오는 중 오류 발생:", err);
                });
        });
    });
});

// 상품 데이터를 받아서 화면에 렌더링하는 함수
function renderProducts(products) {
    const productList = document.getElementById("product-list");
    const totalCountSpan = document.getElementById("total-product-count");
    if (!productList || !totalCountSpan) return;

    // 실제로는 API에서 couponDiscount 등을 받아야 함
    // 여기서는 예시로 "사용 가능한 쿠폰 없음" / "쿠폰적용가" 등 하드코딩
    let html = "";
    products.forEach(product => {
        // 임의 쿠폰 적용가
        const couponAppliedPrice = 135592;
        // 임의 장바구니 쿠폰 할인액
        const cartCouponDiscount = 3408;

        html += `
      <li class="product-item">
        <!-- 왼쪽: 상품 이미지 -->
        <div class="item-img">
          <img src="${product.thumbNailImgUrl}" alt="${product.productName}" />
        </div>
        <!-- 오른쪽: 상품 정보 -->
        <div class="item-info">
          <h3 class="product-name">${product.productName}</h3>
          <p class="product-option">옵션: ${product.name}</p>

          <!-- 가격/수량 + 쿠폰적용가 -->
          <p class="product-price">
            ${(product.finalPrice * product.qty).toLocaleString()}원 / 수량 ${product.qty}개
            <span class="coupon-applied-price">
              쿠폰적용가 : ${couponAppliedPrice.toLocaleString()}원
            </span>
          </p>

          <!-- 쿠폰 정보 -->
          <ul class="coupon-info">
            <li>
              <span class="coupon-label">상품 쿠폰</span>
              <span class="coupon-value">사용 가능한 쿠폰 없음</span>
            </li>
            <li>
              <span class="coupon-label">장바구니 쿠폰</span>
              <span class="coupon-name">ORANGE 회원 10% 할인 쿠폰</span>
              <span class="coupon-discount-amount">-${cartCouponDiscount.toLocaleString()}원</span>
            </li>
          </ul>
        </div>
      </li>
    `;
    });

    productList.innerHTML = html;
    totalCountSpan.textContent = products.length;
}

function showErrorModal(message) {
    var modal = document.querySelector('.modal');
    var modalBody = modal.querySelector('.modal-body');

    modalBody.textContent = message; // 약관 내용 설정
    modal.style.display = 'flex'; // 모달 표시

    // FIXME 이전 페이지 이동 작업 추가 고려 필요
}