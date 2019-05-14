/**
 * Created by sh on 2017/11/17.
 */

/**
 * responseTotalSize    返回数据的条数
 * getDataFunction      ajax请求function
 * currentPageNum       当前页页码
 * currentPageSize      当前一页显示条数
 * isSimple             是否是简短的样式
 * **/
crmApp.directive("linkagePager",["ngToast",function(ngToast){
    return {
        scope: {
            responseTotalSize : "=",
            getDataFunction : "=",
            currentPageNum : "=",
            currentPageSize : "=",
            isSimple : "@"
        },
        restrict: 'EA',
        template: '<div class="pagination-bar"><div class="pagination-box">' +
                        '<!--下拉框-->'+
                        '<div class="pagination-select" ><select ng-model="currentPageSize" ng-change="changePageSizeAction()" ng-hide="isSimple == \'true\'">' +
                            '<option value="{{paginationSelectItem.key}}" ng-repeat="paginationSelectItem in paginationSelectList">{{paginationSelectItem.value}}</option>' +
                        '</select></div>' +

                        '<span class="btn pagination-btn disabled" ng-if="isFirst || responseTotalSize == 0">第一页</span>' +
                        '<span class="btn pagination-btn" ng-if="!isFirst && responseTotalSize != 0" ng-click="prevPageAction()">上一页</span>' +
                        '<!--翻页、页码按钮组-->'+
                        '<ul class="pagination-list"  ng-if="isSimple != \'true\'"><li class="btn pagination-item pagination-item-active"' +
                            'ng-click="paginationItemAction(currentPageNum)">' +
                            '{{currentPageNum}}' +
                            '</li></ul>' +

                        '<!--简洁版展示当前页数/总页数-->'+
                        '<span class="deep-grey-text text-v-center fl" ng-if="isSimple == \'true\'">{{currentPageNum}}</span>' +
                        '<span class="deep-grey-text text-v-center big-gap fl" ng-if="isSimple == \'true\'">/{{lastPageNumber}}</span>' +

                        '<span class="deep-grey-text text-v-center gap fl" ng-hide="isSimple == \'true\'">共<span>{{lastPageNumber}}</span>页</span>' +

                        '<span class="btn pagination-btn big-gap" ng-if="!isLast && responseTotalSize != 0" ng-click="nextPageAction()">下一页</span>' +
                        '<span class="btn pagination-btn disabled" ng-if="isLast || responseTotalSize == 0">最后一页</span>' +

                        '<!--跳转页码-->'+
                        '<span class="deep-grey-text text-v-center big-gap fl">跳转到</span>' +
                        '<input type="text" class="pagination-input big-gap" ng-model="showPageNum" ng-keydown="toPageNumAction($event)">' +
                        '<span class="deep-grey-text text-v-center big-gap fl">页</span>' +

                        '<span class="deep-grey-text text-v-center fr">显示记录{{(currentPageNum-1)*currentPageSize+1}}-{{(currentPageNum)*currentPageSize}}, 共{{responseTotalSize}}条</span>'+
                        // '<span class="btn pagination-btn big-gap" ng-class="{\'disabled\': responseTotalSize == 0}" ng-click="clickToPageNumAction()">确定</span>' +
                    '</div></div>',
        replace: true,
        link: function(scope, element, attributes, controller) {
            /**
             * params
             * **/
            scope.paginationSelectList = [{"key" : "10","value" : "10"},
                {"key" : "20","value" : "20"},
                {"key" : "50","value" : "50"},
                {"key" : "100","value" : "100"},
                {"key" : "500","value" : "500"}
                ];//下拉条数展示列表
            scope.isFirst = true;//是否是第一页
            scope.isLast = true;//是否是最后一页

            if(scope.currentPageSize === null && typeof scope.currentPageSize === 'undefined'){
                scope.currentPageSize = '10';//当前下拉选中条数(分页大小)
            }
            if(typeof scope.currentPageSize === 'number'){
                scope.currentPageSize = scope.currentPageSize.toString();//当前下拉选中条数(分页大小)
            }
            scope.currentPageNum = '1';//当前页码
            scope.showPageNum = scope.currentPageNum;//跳转展示用的页码

            scope.paginationList = [];//按钮组list  如:[1,2,3,4,-1,6]
            scope.lastPageNumber = 0;
            scope.changFlag = false;
            /**
             * init
             * **/
            scope.$watch('responseTotalSize',function (nV,oV) {
                if(nV != oV){
                    checkPagination();
                }
            });
            scope.$watch('currentPageNum',function (nV,oV) {
                if(nV != oV){
                    scope.showPageNum = scope.currentPageNum;//跳转展示用的页码
                    if(scope.changFlag){
                        scope.getDataFunction();
                        scope.changFlag = false;
                    }
                    checkPagination();
                }
            });
            scope.$watch('currentPageSize',function (nV,oV) {
                if(nV != oV){
                    if(scope.changFlag){
                        scope.getDataFunction();
                        scope.changFlag = false;
                    }
                    checkPagination();
                }
            });
            /************************************Action************************************************************************************/
            /**
             * 跳转页码
             * A、回车触发
             * B、点击触发
             * **/
            scope.toPageNumAction = function (e) { //回车触发跳转
                if(scope.currentPageNum === scope.showPageNum){
                    return;
                }
                var keyCode=e.keyCode ? e.keyCode:e.which?e.which:e.charCode;
                if(keyCode == "13"){
                    if(checkGoToPageNum()){
                        scope.changFlag = true;
                        scope.currentPageNum = scope.showPageNum;//当前页码
                    }
                }
            };
            scope.clickToPageNumAction = function () { //失去焦点触发跳转
                if(scope.currentPageNum === scope.showPageNum){
                    return;
                }
                if(checkGoToPageNum()){
                    scope.changFlag = true;
                    scope.currentPageNum = scope.showPageNum;//当前页码
                }
            };
            /**
             * 下拉框选择页数逻辑
             * **/
            scope.changePageSizeAction = function () {
                scope.changFlag = true;
                scope.currentPageNum = '1';//当前页码
            };
            /**
             * 页码按钮逻辑
             * **/
            scope.paginationItemAction = function (itemNumber) {
                if(itemNumber == '-1'){
                    return;
                }
                scope.changFlag = true;
                scope.currentPageNum = itemNumber;
            };
            /**
             * 上一页
             * **/
            scope.prevPageAction = function () {
                if(scope.currentPageNum == '1'){
                    return;
                }
                scope.changFlag = true;
                scope.currentPageNum--;
            };
            /**
             * 下一页
             * **/
            scope.nextPageAction = function () {
                if(scope.currentPageNum == scope.lastPageNumber){
                    return;
                }
                scope.changFlag = true;
                scope.currentPageNum++;
            };
            /**********************************Function******************************************************************************/
            /**
             * 检查当前页码，展示按钮的paginationList
             * **/
            function checkPagination() {
                //判断最后一页
                var isInt = Number(scope.responseTotalSize)%Number(scope.currentPageSize);
                if(isInt == '0'){
                    scope.lastPageNumber = Number(scope.responseTotalSize)/Number(scope.currentPageSize);
                }else{
                    scope.lastPageNumber = (Number(scope.responseTotalSize)-isInt)/Number(scope.currentPageSize)+1;
                }
                checkIsFirstOrLast(scope.lastPageNumber);
                formatterPaginationList(scope.lastPageNumber);
            }
            /**
             * 检查是否是第一页或者最后一页
             * **/
            function checkIsFirstOrLast(lastPageNum) {
                if(scope.currentPageNum == '1'){
                    scope.isFirst = true;
                }else{
                    scope.isFirst = false;
                }
                if(scope.currentPageNum == lastPageNum){
                    scope.isLast = true;
                }else{
                    scope.isLast = false;
                }
            }
            /**
             * 格式化按钮组list,情况如下：
             * A、当最后一页小于等于8，有多少展示多少 [1,2,3,4,5,6,7,8]
             * B、当最后一页大于8
             *  b1、前面6个，后面省略号，最后一页 [1,2,3,4,5,6,-1,9]
             *  b2、后面6个，前面省略号，第一页 [1,-1,4,5,6,7,8,9]
             *  b3、第一页，省略号，中间5个，省略号，最后一页 [1,-1,3,4,5,6,7,-1,9]
             * **/
            function formatterPaginationList(lastPageNum) {
                // scope.paginationList = [];
                if(lastPageNum <= 8){ //A
                    scope.paginationList = angular.copy(scope.paginationList.slice(0,lastPageNum));
                    for(var i=1;i<=lastPageNum;i++){
                        scope.paginationList[i-1] = i;
                    }
                }else{ //B
                    if(scope.currentPageNum < 5){ //b1----[1,2,3,4,5,6,-1,9]
                        scope.paginationList = angular.copy(scope.paginationList.slice(0,7));
                        for(var j=1;j<=8;j++){
                            if(j < 7){
                                scope.paginationList[j-1] = j;
                            }else if(j === 7){
                                scope.paginationList[j-1] = -1;
                            }else{
                                scope.paginationList[j-1] = lastPageNum;
                            }
                        }
                    }else if(lastPageNum - scope.currentPageNum < 4){ //b2----[1,-1,4,5,6,7,8,9]
                        scope.paginationList = angular.copy(scope.paginationList.slice(0,7));
                        for(var k=7;k>=0;k--){
                            if(k === 7){
                                scope.paginationList[7-k] = 1;
                            }else if(k === 6){
                                scope.paginationList[7-k] = -1;
                            }else if(k < 6){
                                scope.paginationList[7-k] = Number(lastPageNum)-k;
                            }
                        }
                    }else{  //b3----[1,-1,3,4,5,6,7,-1,9]
                        for(var l=0;l<=8;l++){
                            scope.paginationList = angular.copy(scope.paginationList.slice(0));
                            if(l === 0){
                                scope.paginationList[l] = 1;
                            }else if(l === 1 || l === 7){
                                scope.paginationList[l] = -1;
                            }else if(l === 8){
                                scope.paginationList[l] = lastPageNum;
                            }else{
                                scope.paginationList[l] = Number(scope.currentPageNum)-4+l;
                            }
                        }
                    }
                }
            }
            /**
             * 检查输入框的值
             * **/
            function checkGoToPageNum() {
                var tipsStr = '';
                var reg = /^[1-9]\d*$/;
                if(scope.showPageNum > scope.lastPageNumber){
                    tipsStr = '最大页码为:'+scope.lastPageNumber+'<br/>请输入有效页码';
                    toast(tipsStr);
                    scope.showPageNum = "";
                    return false;
                }else if(scope.showPageNum < 1){
                    tipsStr = '最小页码为:1<br/>请输入有效页码';
                    toast(tipsStr);
                    scope.showPageNum = "";
                    return false;
                }else if(scope.showPageNum === "" || scope.showPageNum === undefined){
                    tipsStr = '请输入页码';
                    toast(tipsStr);
                    return false;
                }else if(!reg.test(scope.showPageNum)){
                    tipsStr = '请输入正确页码';
                    toast(tipsStr);
                    return false;
                }else{
                    return true;
                }
            }
            /**
             * warning toast
             * **/
            function toast(string){
                ngToast.create({
                    className: 'warning',
                    timeout:2000,
                    content: string,
                    zIndex : 9999
                });
            }
        }
    }
}]);